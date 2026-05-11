import { Router } from 'express';
import * as service from './category.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({ name: z.string().min(1), parentId: z.string().uuid().nullable().optional() });

router.get('/', requirePermission('categories', 'read'), asyncHandler(async (req, res) => {
  const data = await service.listCategories(req.params.tenantId);
  return res.status(200).json(data);
}));

router.post('/', requirePermission('categories', 'write'), asyncHandler(async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await service.createCategory(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
}));

router.patch('/:categoryId', requirePermission('categories', 'write'), asyncHandler(async (req, res) => {
  try {
    const updated = await service.updateCategory(req.params.tenantId, req.params.categoryId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

router.delete('/:categoryId', requirePermission('categories', 'admin'), asyncHandler(async (req, res) => {
  try {
    await service.deleteCategory(req.params.tenantId, req.params.categoryId);
    return res.status(204).send();
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

export default router;
