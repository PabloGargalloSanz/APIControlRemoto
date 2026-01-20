import './utils/envLoader.js';
import cron from 'node-cron';
import { getSystemMetrics } from './workers/metrics.worker.js';
import { cleanOldData } from './workers/maintenance.worker.js';
import { checkWarnings } from './workers/warnings.worker.js';

//debug
console.log('Sistema de monitorización y mantenimiento iniciado.');

// s min h dias diaMes mes diaSemana
// *  *  *  *     *     *      *

// obtencion de metricas y subida
cron.schedule('* * * * *', async () => {
    // Inicio del worker debug
    console.log(' Worker de metricas iniciado. Frecuencia: 1 minuto.');

    const metrics = await getSystemMetrics();

    if(metrics){
        checkWarnings(metrics);
    }
});

// limpieza de datos viejos
cron.schedule('0 0 3 * * *', () => {
    cleanOldData(30, 60); // 30 dias metricas y 60 dias avisos
});
