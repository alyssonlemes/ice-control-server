import { Router } from 'express';
import * as service from './customer.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(), address: z.string().optional() });

router.get('/', requirePermission('customers', 'read'), async (req, res) => {
  const result = await service.listCustomers(req.params.tenantId, req.query);
  return res.status(200).json(result);
});

router.post('/', requirePermission('customers', 'write'), async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const created = await service.createCustomer(req.params.tenantId, parsed);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
});

router.get('/:customerId/orders', requirePermission('customers', 'read'), async (req, res) => {
  const orders = await service.getCustomerOrders(req.params.tenantId, req.params.customerId);
  return res.status(200).json(orders);
});

router.patch('/:customerId', requirePermission('customers', 'write'), async (req, res) => {
  try {
    const updated = await service.updateCustomer(req.params.tenantId, req.params.customerId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
});

router.delete('/:customerId', requirePermission('customers', 'admin'), async (req, res) => {
  try {
    await service.deleteCustomer(req.params.tenantId, req.params.customerId);
    return res.status(204).send();
  } catch (err: any) {
    const status = err.code === 'NOT_FOUND' ? 404 : 500;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
});

export default router;
