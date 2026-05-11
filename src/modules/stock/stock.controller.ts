import { Router } from 'express';
import * as service from './stock.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const movementSchema = z.object({ productId: z.string().uuid(), type: z.enum(['in', 'out', 'adjustment']), quantity: z.number().int().min(1), reason: z.string().optional(), supplierId: z.string().uuid().optional().nullable() });

router.get('/', requirePermission('stock', 'read'), async (req, res) => {
  const result = await service.listStock(req.params.tenantId, req.query);
  return res.status(200).json(result);
});

router.post('/movements', requirePermission('stock', 'write'), async (req, res) => {
  try {
    const parsed = movementSchema.parse(req.body);
    const created = await service.createMovement(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
});

router.get('/movements', requirePermission('stock', 'read'), async (req, res) => {
  const result = await service.listMovements(req.params.tenantId, req.query);
  return res.status(200).json(result);
});

export default router;
