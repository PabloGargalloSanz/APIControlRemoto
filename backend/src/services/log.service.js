import pool from '../db/db.js';

//Insercion de log en db
const newLog = async (userId, action, ip, command, details) =>{
    const safeIp = ip || '0.0.0.0'; //evitar posibles problemas insercion DB

    const result = await pool.query(
        'INSERT INTO logs (usuario_id, accion, ip_origen, comando_ejecutado, detalles) VALUES ($1,$2,$3,$4,$5)',
        [userId, action, safeIp, command, details]
    );
    return result.rows[0];
    
}

//Servicio log generico
export const logAuth = (userId, action, ip, details) => {
    newLog(userId, action, ip, null, details);
}

//Servicio log shell
export const logShell = (userId, ip, command, details) => {
    newLog(userId, 'SHELL', ip, command, details);
}

//Servicio log error
export const logError = (userId, action, ip,  details) => {
    newLog(userId, action, ip, null, details);
}