import {Router} from 'express';
import { getSystemMetrics } from '../workers/metrics.worker.js';
import { checkWarnings } from '../workers/warnings.worker.js';
import { formatMetrics } from '../workers/formatMetrics.worker.js';

const router = Router();

router.get('/status', async (req, res) => {
    const stats = await getSystemMetrics();
    const warnings = checkWarnings(stats);
    const formattedMetrics = formatMetrics(stats);

    res.json({ 
        metrics: formattedMetrics, 
        alerts: warnings 
    });
});

export default router;