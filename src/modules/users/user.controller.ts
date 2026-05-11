import { Router } from 'express';
import * as service from './user.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { asyncHandler } from '../../utils/async-handler';

const router = Router({ mergeParams: true });

router.get('/', requirePermission('users', 'read'), asyncHandler(async (req, res) => {
  const tenantId = req.params.tenantId;
  const users = await service.listUsers(tenantId);
  return res.status(200).json(users);
}));

router.post('/', requirePermission('users', 'write'), asyncHandler(async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const created = await service.createUser(tenantId, req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: 'ERROR', message: err.message || 'Error creating user' });
  }
}));

router.patch('/:userId', requirePermission('users', 'write'), asyncHandler(async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const userId = req.params.userId;
    const updated = await service.updateUser(tenantId, userId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

router.delete('/:userId', requirePermission('users', 'admin'), asyncHandler(async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const userId = req.params.userId;
    await service.deleteUser(tenantId, userId);
    return res.status(204).send();
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

export default router;
