import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../config';

export function signAccess(payload: object, expiresIn = '15m') {
  return jwt.sign(payload as any, JWT_ACCESS_SECRET as any, { expiresIn } as any);
}

export function signRefresh(payload: object, expiresIn = '7d') {
  return jwt.sign(payload as any, JWT_REFRESH_SECRET as any, { expiresIn } as any);
}

export function verifyAccess(token: string) {
  return jwt.verify(token as any, JWT_ACCESS_SECRET as any) as any;
}

export function verifyRefresh(token: string) {
  return jwt.verify(token as any, JWT_REFRESH_SECRET as any) as any;
}
