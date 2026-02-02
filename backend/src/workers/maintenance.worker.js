import pool from '../db/db.js';

export const cleanOldData = async (daysMetrics = 30, daysAlerts = 60) => {
    try {
        console.log(`[Mantenimiento] Iniciando limpieza...`);

        const resMetrics = await pool.query(
            "DELETE FROM metricas_sistema WHERE fecha < NOW() - (INTERVAL '1 day' * $1)", 
            [daysMetrics]
        );

        const resAlerts = await pool.query(
            "DELETE FROM avisos WHERE fecha < NOW() - (INTERVAL '1 day' * $1)", 
            [daysAlerts]
        );

        console.log(`[Mantenimiento] Eliminados: ${resMetrics.rowCount} métricas y ${resAlerts.rowCount} avisos.`);
    } catch (error) {
        console.error('❌ Error en maintenance worker:', error.message);
    }
};