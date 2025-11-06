import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db';
import { asyncHandler } from '../utils/http';
import { hashPassword, comparePassword } from '../utils/password';
import { requireAuth } from '../middleware/auth';
import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
  parseRefreshExp,
  createPasswordResetToken,
} from '../services/tokens';
import { sendPasswordResetEmail } from '../services/email';
import jwt from 'jsonwebtoken';

const router = Router();

/* -------------------------------- Register -------------------------------- */
router.post(
  '/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').optional().isString().isLength({ max: 255 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password, name } = req.body;

    const { rows: existing } = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = await hashPassword(password);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, is_active, email_verified)
       VALUES ($1, $2, true, false)
       RETURNING id, email, email_verified`,
      [email, password_hash]
    );
    const user = rows[0];

    if (name) {
      await pool.query(`INSERT INTO user_profiles (user_id, name) VALUES ($1, $2)`, [user.id, name]);
    }
    await pool.query(`INSERT INTO user_stats (user_id) VALUES ($1)`, [user.id]);

    // Get profile and stats for response
    const { rows: profileRows } = await pool.query(
      `SELECT name, bio, avatar_url FROM user_profiles WHERE user_id = $1`,
      [user.id]
    );
    const { rows: statsRows } = await pool.query(
      `SELECT total_workouts, total_workout_minutes FROM user_stats WHERE user_id = $1`,
      [user.id]
    );

    // Generate tokens for auto-login after registration
    const accessToken = createAccessToken({ id: user.id, email: user.email });
    const refreshToken = createRefreshToken({ id: user.id, email: user.email });
    const expiresAt = parseRefreshExp(refreshToken);
    await storeRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(201).json({
      user: { id: user.id, email: user.email, email_verified: user.email_verified },
      profile: profileRows[0] || null,
      stats: statsRows[0] || null,
      access_token: accessToken,
      refresh_token: refreshToken
    });
  })
);

/* --------------------------------- Login ---------------------------------- */
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, email_verified, is_active FROM users WHERE email = $1`,
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ error: 'Account disabled' });

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    // Get profile and stats for response
    const { rows: profileRows } = await pool.query(
      `SELECT name, bio, avatar_url FROM user_profiles WHERE user_id = $1`,
      [user.id]
    );
    const { rows: statsRows } = await pool.query(
      `SELECT total_workouts, total_workout_minutes FROM user_stats WHERE user_id = $1`,
      [user.id]
    );

    const accessToken = createAccessToken({ id: user.id, email: user.email });
    const refreshToken = createRefreshToken({ id: user.id, email: user.email });

    const expiresAt = parseRefreshExp(refreshToken);
    await storeRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(200).json({
      user: { id: user.id, email: user.email, email_verified: user.email_verified, is_active: user.is_active },
      profile: profileRows[0] || null,
      stats: statsRows[0] || null,
      access_token: accessToken,
      refresh_token: refreshToken
    });
  })
);

/* -------------------------------- Refresh --------------------------------- */
router.post(
  '/refresh',
  body('refreshToken').isString(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { refreshToken } = req.body;
    const userId = await isRefreshTokenValid(refreshToken);
    if (!userId) return res.status(401).json({ error: 'Invalid refresh token' });

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    } catch {
      await revokeRefreshToken(refreshToken);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    await revokeRefreshToken(refreshToken);

    const user = { id: payload.sub as string, email: payload.email as string };
    const newAccess = createAccessToken(user);
    const newRefresh = createRefreshToken(user);
    const expiresAt = parseRefreshExp(newRefresh);
    await storeRefreshToken(user.id, newRefresh, expiresAt);

    return res.status(200).json({ accessToken: newAccess, refreshToken: newRefresh });
  })
);

/* --------------------------------- Logout --------------------------------- */
router.post(
  '/logout',
  body('refreshToken').isString(),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);
    return res.status(200).json({ ok: true });
  })
);

/* ---------------------------- Forgot Password ----------------------------- */
router.post(
  '/forgot-password',
  body('email').isEmail().normalizeEmail(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email } = req.body;
    const { rows } = await pool.query(`SELECT id, email FROM users WHERE email = $1`, [email]);

    if (!rows.length) return res.status(200).json({ ok: true });

    const user = rows[0];
    const token = createPasswordResetToken({ id: user.id, email: user.email });
    await sendPasswordResetEmail(user.email, token);
    return res.status(200).json({ ok: true });
  })
);

/* ----------------------------- Reset Password ----------------------------- */
router.post(
  '/reset-password',
  body('token').isString(),
  body('newPassword').isLength({ min: 8 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { token, newPassword } = req.body;

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_RESET_SECRET!);
      if (payload.type !== 'password_reset') throw new Error('Invalid token type');
    } catch {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const newHash = await hashPassword(newPassword);
    await pool.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      newHash,
      payload.sub,
    ]);

    await pool.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [payload.sub]);

    return res.status(200).json({ ok: true });
  })
);

/* ----------------------------------- Me ----------------------------------- */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, email, is_active, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user: rows[0] });
  })
);

export default router;