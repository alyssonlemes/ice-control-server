import { Router } from 'express';
import * as service from './product.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().optional().nullable(),
  costPrice: z.number().optional(),
  salePrice: z.number().optional(),
  unit: z.string().optional(),
  minStockAlert: z.number().optional(),
  description: z.string().optional().nullable()
});

router.get('/', requirePermission('products', 'read'), asyncHandler(async (req, res) => {
  const result = await service.listProducts(req.params.tenantId, req.query);
  return res.status(200).json(result);
}));

router.get('/:productId', requirePermission('products', 'read'), asyncHandler(async (req, res) => {
  const product = await service.getProduct(req.params.tenantId, req.params.productId);
  if (!product) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
  return res.status(200).json(product);
}));

router.post('/', requirePermission('products', 'write'), asyncHandler(async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await service.createProduct(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
}));

router.patch('/:productId', requirePermission('products', 'write'), asyncHandler(async (req, res) => {
  try {
    const updated = await service.updateProduct(req.params.tenantId, req.params.productId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

router.delete('/:productId', requirePermission('products', 'admin'), asyncHandler(async (req, res) => {
  try {
    await service.deleteProduct(req.params.tenantId, req.params.productId);
    return res.status(204).send();
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

export default router;
