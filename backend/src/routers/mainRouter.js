import {Router} from 'express';

import authRoutes from './auth.routes.js';
import metricsRoutes from '../routers/metrics.routes.js';
import shellRoutes from '../routers/shell.routes.js';
import logRoutes from '../routers/log.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/metrics', metricsRoutes);
router.use('/shell', shellRoutes);
router.use('/log', logRoutes);

export default router;