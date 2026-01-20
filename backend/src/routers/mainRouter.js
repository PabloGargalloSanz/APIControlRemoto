import {Router} from 'express';

import authRoutes from './auth.routes.js';
import metricsRoutes from '../routers/metrics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/metrics', metricsRoutes);

export default router;