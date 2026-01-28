import pool from '../db/db.js';

//Insercion de log en db
const newLog = async (userId, action, ip, method, rute, command, details, statusCode) =>{
    const safeIp = ip || '0.0.0.0'; //evitar posibles problemas insercion DB

    try{
        const result = await pool.query(
            'INSERT INTO logs (usuario_id, accion, ip_origen, metodo, ruta, comando_ejecutado, detalles, status_codigo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
            [userId, action, safeIp, method, rute, command, details, statusCode]
        );
        return result.rows[0];
    
    
    } catch (dbErr) {
        // Usamos console.error para no perder el rastro si falla la DB
        console.error("❌ Error real en la query de logs:", dbErr.message);
    }
}

// columnas db
//usuario_id, accion, ip_origen, metodo, ruta, comando_ejecutado, detalles, status_codigo

//Servicio log generico
export const logAll = (userId, action, ip, method = null, rute = null, details, statusCode) => {
    newLog(userId, action, ip, method, rute, null, 'OK: ' + details, statusCode);
}

//Servicio log shell
export const logShell = (userId, ip, route, command, details, statusCode) => {
    newLog(userId, 'SHELL', ip, 'EXEC', route, command, details, statusCode);
}

//Servicio log error
export const logError = (userId, action, ip, method, rute, details, statusCode) => {
    newLog(userId, action, ip, method, rute, null, 'ERROR: ' + details, statusCode);
}