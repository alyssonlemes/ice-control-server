import { Router } from 'express';
import * as service from './auth.service';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

router.post('/login', limiter, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err.code === 'INVALID_CREDENTIALS' ? 401 : 404;
    return res.status(status).json({ error: err.code || 'ERROR', message: err.message || 'Error' });
  }
}));

router.post('/refresh', limiter, asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await service.refresh(refreshToken);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.code || 'INVALID_TOKEN', message: err.message || 'Invalid token' });
  }
}));

router.post('/logout', asyncHandler(async (req, res) => {
  // Require auth middleware externally if needed; here we accept and return 204.
  return res.status(204).send();
}));

export default router;
