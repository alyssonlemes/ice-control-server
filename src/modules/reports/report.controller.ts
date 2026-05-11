import { Router } from 'express';
import * as service from './report.service';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router({ mergeParams: true });

router.get('/best-sellers', requirePermission('reports', 'read'), async (req, res) => {
  const data = await service.bestSellers(req.params.tenantId, req.query);
  return res.status(200).json(data);
});

router.get('/sales-by-period', requirePermission('reports', 'read'), async (req, res) => {
  const data = await service.salesByPeriod(req.params.tenantId, req.query);
  return res.status(200).json(data);
});

router.get('/profit-margin', requirePermission('reports', 'read'), async (req, res) => {
  const data = await service.profitMargin(req.params.tenantId, req.query);
  return res.status(200).json(data);
});

router.get('/cash-flow', requirePermission('reports', 'read'), async (req, res) => {
  const data = await service.cashFlow(req.params.tenantId, req.query);
  return res.status(200).json(data);
});

export default router;
