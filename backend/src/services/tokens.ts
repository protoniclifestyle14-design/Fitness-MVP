import pool from '../db';
import { signJwt, verifyJwt } from '../utils/jwt';

export const createAccessToken = (user: { id: string; email: string }) =>
  signJwt(
    { sub: user.id, email: user.email, type: 'access' },
    process.env.JWT_ACCESS_SECRET!,
    process.env.JWT_ACCESS_TTL || '15m'
  );

export const createRefreshToken = (user: { id: string; email: string }) =>
  signJwt(
    { sub: user.id, email: user.email, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    process.env.JWT_REFRESH_TTL || '30d'
  );

export const createPasswordResetToken = (user: { id: string; email: string }) =>
  signJwt(
    { sub: user.id, email: user.email, type: 'password_reset' },
    process.env.JWT_RESET_SECRET!,
    process.env.JWT_RESET_TTL || '15m'
  );

export const storeRefreshToken = async (userId: string, token: string, expiresAt: Date) => {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};

export const revokeRefreshToken = async (token: string) => {
  await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};

export const isRefreshTokenValid = async (token: string) => {
  const { rows } = await pool.query(
    `SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1`,
    [token]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  if (new Date(row.expires_at) < new Date()) return null;
  return row.user_id as string;
};

export const parseRefreshExp = (token: string) => {
  const payload = verifyJwt(token, process.env.JWT_REFRESH_SECRET!);
  return new Date((payload as any).exp * 1000);
};