import {Router} from 'express';
import { getSystemMetrics } from '../workers/metrics.worker.js';
import { checkWarnings } from '../workers/warnings.worker.js';

const router = Router();

router.get('/status', async (req, res) => {
    const stats = await getSystemMetrics();
    const warnings = checkWarnings(stats);
    res.json({ 
        metrics: stats, 
        alerts: warnings 
    });
});

export default router;