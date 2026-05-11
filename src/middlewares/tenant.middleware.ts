import { Request, Response, NextFunction } from 'express';

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.params.tenantId;
  if (!tenantId) return res.status(400).json({ error: 'INVALID_TENANT', message: 'tenantId is required in path' });
  if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing user' });
  if (req.user.tenantId !== tenantId) return res.status(403).json({ error: 'FORBIDDEN', message: 'User not in this tenant' });
  return next();
}
