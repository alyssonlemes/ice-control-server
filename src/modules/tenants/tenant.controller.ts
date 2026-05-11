import { Router } from 'express';
import * as service from './tenant.service';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  try {
    const { name, email, adminName, adminPassword } = req.body;
    const tenant = await service.createTenant(name, email, adminName, adminPassword);
    return res.status(201).json({ id: tenant.id, name: tenant.name, email: tenant.email, createdAt: tenant.createdAt });
  } catch (err: any) {
    return res.status(500).json({ error: 'ERROR', message: err.message || 'Error creating tenant' });
  }
}));

export default router;
