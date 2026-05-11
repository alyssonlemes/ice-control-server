import { Request, Response, NextFunction } from 'express';

export type Permission = 'none' | 'read' | 'write' | 'admin';

const order: Record<Permission, number> = { none: 0, read: 1, write: 2, admin: 3 };

export function requirePermission(moduleName: string, minPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const perms = (req.user && (req.user as any).permissions) || {};
    const userPerm = (perms[moduleName] || 'none') as Permission;
    if (order[userPerm] < order[minPermission]) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions' });
    }
    return next();
  };
}
