import '../utils/envLoader.js';

import si from 'systeminformation';
import pool from '../db/db.js';

//debug
console.log("Contraseña cargada:", process.env.DB_PASSWORD ? "SÍ" : "NO");

//funcion obtener datos
const collectMetrics = async () => {
    try {
        const [cpu, mem, disk, net] = await Promise.all([
            si.currentLoad(),    // % CPU
            si.mem(),            // % RAM
            si.fsSize(),         // % Disco 
            si.networkStats()    //  Red 
        ]);
        // CPU
        const cpuUso = cpu.currentLoad.toFixed(2);
        
        // calculo % de RAM
        const ramUso = ((mem.active / mem.total) * 100).toFixed(2);
        
        // % primer disco detectado 
        const discoUso = disk[0] ? disk[0].use.toFixed(2) : 0;

        //mb
        const MB = 1024 * 1024;

        // Bytes recibidos (rx) y transmitidos (tx)
        const netIn = net[0] ? (net[0].rx_bytes/MB).toFixed(2) : 0;
        const netOut = net[0] ? (net[0].tx_bytes/MB).toFixed(2) : 0;

        const result = await pool.query(
            'INSERT INTO metricas_sistema (cpu_uso, ram_uso, disco_uso, net_in, net_out) VALUES ($1, $2, $3, $4, $5)', 
            [cpuUso, ramUso, discoUso, netIn, netOut]
        );
        
        const metrics = result.rows[0];

        //debug
        console.log(`[${new Date().toLocaleTimeString()}] CPU ${cpuUso}% | RAM ${ramUso}% | Disco ${discoUso}% | Net In ${netIn} MB | Net Out ${netOut} MB`);

    } catch (error) {
        console.error('❌ Error en el Worker de metricas:', error.message);
    }
};

// Inicio del worker para comprobar su funcionamiento
console.log(' Worker de metricas iniciado. Frecuencia: 1 minuto.');

collectMetrics();

// intervalo de 1 min (
setInterval(collectMetrics, 60000);