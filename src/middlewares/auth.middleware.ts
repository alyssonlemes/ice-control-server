import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing token' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = verifyAccess(token) as any;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}
