import { Router } from 'express';
import * as service from './supplier.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({ name: z.string().min(1), contactName: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), paymentTerms: z.string().optional(), address: z.string().optional() });

router.get('/', requirePermission('suppliers', 'read'), async (req, res) => {
  const data = await service.listSuppliers(req.params.tenantId);
  return res.status(200).json(data);
});

router.post('/', requirePermission('suppliers', 'write'), async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await service.createSupplier(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
});

router.patch('/:supplierId', requirePermission('suppliers', 'write'), async (req, res) => {
  try {
    const updated = await service.updateSupplier(req.params.tenantId, req.params.supplierId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
});

router.delete('/:supplierId', requirePermission('suppliers', 'admin'), async (req, res) => {
  try {
    await service.deleteSupplier(req.params.tenantId, req.params.supplierId);
    return res.status(204).send();
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
});

export default router;
