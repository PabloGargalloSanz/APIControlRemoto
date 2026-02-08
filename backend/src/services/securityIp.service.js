import pool from "../db/db.js";

//comprobacion fallos recientes
export const recentFailures = async (ip) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM logs
        WHERE ip_origen = $1
        AND accion = 'AUTH_LOGIN_FAIL'
        AND fecha_creado > NOW() - INTERVAL '15 minutes'
        `,
        [ip]
    );
    return parseInt(result.rows[0].count);
}

//insertar ip bloqueada
export const bloquearIp = async (ip, razon) => {
    try{
        const result = await pool.query(
            `INSERT INTO ips_bloqueadas (ip, razon) 
            VALUES ($1, $2)
            `,
            [ip, razon]
        );
        return result.rows[0];

    } catch(dbErr){
        console.error(" Error real en la query de ip:", dbErr.message);

    }
}

//comprobar si ip bloqueada
export const ipBloqueada = async (ip) => {
    try{
        const result = await pool.query(
            `SELECT 1 FROM ips_bloqueadas
            WHERE ip = $1
            `,
            [ip]
        );
        return result.rows.length > 0;
    }catch(dbErr){
        console.error(" Error real en la query de ip:", dbErr.message);

    }
}
    

