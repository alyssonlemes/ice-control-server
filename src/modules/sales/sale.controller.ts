import { Router } from 'express';
import * as service from './sale.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({
  customerId: z.string().uuid().nullable(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1), unitPrice: z.number(), discount: z.number().optional() })),
  discount: z.number().optional(),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.enum(['cash', 'card', 'pix'])
});

router.get('/', requirePermission('sales', 'read'), asyncHandler(async (req, res) => {
  const result = await service.listSales(req.params.tenantId, req.query);
  return res.status(200).json(result);
}));

router.post('/', requirePermission('sales', 'write'), asyncHandler(async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await service.createSale(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
}));

router.patch('/:saleId/cancel', requirePermission('sales', 'write'), asyncHandler(async (req, res) => {
  try {
    const cancelled = await service.cancelSale(req.params.tenantId, req.params.saleId);
    return res.status(200).json({ id: cancelled?.id, status: 'cancelled' });
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

export default router;

