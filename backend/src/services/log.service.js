import pool from '../db/db.js';

//Insercion de log en db
const newLog = async (userId, action, ip, method, rute, command, details) =>{
    const safeIp = ip || '0.0.0.0'; //evitar posibles problemas insercion DB

    try{
        const result = await pool.query(
            'INSERT INTO logs (usuario_id, accion, ip_origen, metodo, ruta, comando_ejecutado, detalles) VALUES ($1,$2,$3,$4,$5,$6,$7)',
            [userId, action, safeIp, method, rute, command, details]
        );
        return result.rows[0];
    
    
    } catch (dbErr) {
        // Usamos console.error para no perder el rastro si falla la DB
        console.error("❌ Error real en la query de logs:", dbErr.message);
    }
}

// columnas db
//usuario_id, accion, ip_origen, metodo, ruta, comando_ejecutado, detalles

//Servicio log generico
export const logAuth = (userId, action, ip, method = null, rute = null, details) => {
    newLog(userId, action, ip, method, rute, null, 'OK: ' + details);
}

//Servicio log shell
export const logShell = (userId, ip, command, details) => {
    newLog(userId, 'SHELL', ip, null, null, command, details);
}

//Servicio log error
export const logError = (userId, action, ip, method, rute, details) => {
    newLog(userId, action, ip, method, rute, null, 'ERROR: ' + details);
}