import { Router } from 'express';
import * as service from './financial.service';
import { requirePermission } from '../../middlewares/permission.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const openSchema = z.object({ openingBalance: z.number() });

router.get('/cashier', requirePermission('financial', 'read'), asyncHandler(async (req, res) => {
  const data = await service.getCashier(req.params.tenantId, req.query.date as any);
  return res.status(200).json(data);
}));

router.post('/cashier/open', requirePermission('financial', 'write'), asyncHandler(async (req, res) => {
  try {
    const parsed = openSchema.parse(req.body);
    const created = await service.openCashier(req.params.tenantId, parsed.openingBalance);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
}));

router.post('/cashier/close', requirePermission('financial', 'write'), asyncHandler(async (req, res) => {
  const closed = await service.closeCashier(req.params.tenantId, req.body.date);
  return res.status(200).json(closed);
}));

router.get('/expenses', requirePermission('financial', 'read'), asyncHandler(async (req, res) => {
  const result = await service.listExpenses(req.params.tenantId, req.query);
  return res.status(200).json(result);
}));

router.post('/expenses', requirePermission('financial', 'write'), asyncHandler(async (req, res) => {
  try {
    const created = await service.createExpense(req.params.tenantId, req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', message: err.message });
  }
}));

router.get('/accounts-receivable', requirePermission('financial', 'read'), asyncHandler(async (req, res) => {
  const data = await service.accountsReceivable(req.params.tenantId);
  return res.status(200).json(data);
}));

router.get('/accounts-payable', requirePermission('financial', 'read'), asyncHandler(async (req, res) => {
  const data = await service.accountsPayable(req.params.tenantId);
  return res.status(200).json(data);
}));

export default router;
