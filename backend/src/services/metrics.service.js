import pool from '../db/db.js';

//obtencion de logs de avisos metricas
export const getLogWarningMetricasService = async() =>{
    const result = await pool.query(
        `SELECT *  
        FROM avisos
        ORDER BY id DESC 
        LIMIT 50`
    );
    return result.rows;
}