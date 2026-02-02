import pool from '../db/db.js';

//obtencion de logs de shell
export const getLogShellService = async() =>{
    const result = await pool.query(
        `SELECT id, ip_origen, comando_ejecutado, status_codigo, fecha_creado 
        FROM logs 
        WHERE metodo = 'EXEC' 
        ORDER BY id DESC 
        LIMIT 100`
    );
    return result.rows;
}
