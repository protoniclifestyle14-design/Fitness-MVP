import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; [k: string]: any };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  const token = header.slice(7);
  
  try {
    const payload = verifyJwt(token, process.env.JWT_ACCESS_SECRET!);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};