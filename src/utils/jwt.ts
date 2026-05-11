import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../config';

export function signAccess(payload: object, expiresIn = '15m') {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn });
}

export function signRefresh(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
