import '../utils/envLoader.js';
import si from 'systeminformation';
import pool from '../db/db.js';
import fs from 'fs';


//debug
console.log("Contraseña cargada:", process.env.DB_PASSWORD ? "SÍ" : "NO");



// almacenamiento ultimo valor disco
let lastDisk = { r: 0, w: 0, t: Date.now() };

// obtencion metricas
export const getSystemMetrics = async () => {
    try{ // quitar dIO y si.disksIO() cuando este server
        const [cpuLoad, tempRes, mem, disk, net, gpu, cpuInfo, dIO] = await Promise.all([
            si.currentLoad(),    // % CPU
            si.cpuTemperature(), // º CPU
            si.mem(),            // % RAM
            si.fsSize(),         // % Disco 
            si.networkStats(),   // Red 
            si.graphics(),        // GPU
            si.cpu(),            // Frecuencia CPU
            si.disksIO()         // I/O de disco
        ]);

        // mb
        const MB = 1024 * 1024;
        const ahora = Date.now();
        const diffTiempo = (ahora - lastDisk.t) / 1000;

        //////////////// CPU
        const cpuUso = cpuLoad.currentLoad.toFixed(2);

        // si la placa no tiene receptor temp = 0
        const cpuTemp = (tempRes.main && tempRes.main > 0) ? tempRes.main.toFixed(1) : 0;
        
        //frecuencia en ghz
        const cpuFreq = cpuInfo.speed;
        
        //promedio carga 1min
        const cpuCarga = (cpuLoad.avgLoad && cpuLoad.avgLoad.length > 0) ? cpuLoad.avgLoad[0] : 0;

        // n cores
        const cpuCores= cpuInfo.cores || 1;

        ////////////// GPU
        const mainGpu = gpu.controllers && gpu.controllers.length > 0 ? gpu.controllers[0] : null;
        
        //carga nucleo
        const gpuUso = mainGpu && mainGpu.utilizationGpu ? mainGpu.utilizationGpu : 0;
        const gpuTemp = mainGpu && mainGpu.temperatureGpu ? mainGpu.temperatureGpu : 0;
        
        //uso vram
        const gpuMemUso = mainGpu && mainGpu.utilizationMemory ? mainGpu.utilizationMemory : 0;

        ///////////RAM

        // calculo % de RAM
        const ramUso = (mem.total > 0) ? ((mem.active / mem.total) * 100).toFixed(2) : 0;
        const ramDisponible = (mem.available / MB).toFixed(2); 

        //memoria intercambio (ssd)
        const swapUso = (mem.swaptotal > 0) ? ((mem.swapused / mem.swaptotal) * 100).toFixed(2) : 0;

        /////////// DISCO 
        /* SERVIDOR
        const mainDisk = disk.find(d => d.mount === '/') || disk[0];
        const discoUso = mainDisk.use.toFixed(2);

        // lectura / escritura disco desde kernel
        const stats = fs.readFileSync('/proc/diskstats', 'utf8');
        const nvmeLine = stats.split('\n').find(line => line.includes('nvme0n1 ')); // nombre disco principal
        const col = nvmeLine ? nvmeLine.trim().split(/\s+/) : [];
        
        const sectorsR = parseInt(col[5] || 0);
        const sectorsW = parseInt(col[9] || 0);

        // calculo de MB/s: (Sectores nuevos - anteriores) * 512 bytes / tiempo / MB
        const discoRead = lastDisk.r > 0 ? (((sectorsR - lastDisk.r) * 512) / diffTiempo / MB).toFixed(2) : "0.00";
        const discoWrite = lastDisk.w > 0 ? (((sectorsW - lastDisk.w) * 512) / diffTiempo / MB).toFixed(2) : "0.00";
        
        lastDisk = { r: sectorsR, w: sectorsW, t: ahora };
        */

        //////////////////////////////////////
       /*ORDENADOR CLASE*/
        const discoUso = disk[0] ? disk[0].use.toFixed(2) : 0;

        // MB/s lectura
        const discoRead = dIO?.rIO_sec ? (dIO.rIO_sec / MB).toFixed(2) : 0;

        // MB/s escritura
        const discoWrite = dIO?.wIO_sec ? (dIO.wIO_sec / MB).toFixed(2) : 0; 
        /////////////////////////////////////

        ////////// RED Bytes recibidos (rx) y transmitidos (tx)
        const netIn = (net[0] && net[0].rx_bytes) ? (net[0].rx_bytes / MB).toFixed(2) : 0;
        const netOut = (net[0] && net[0].tx_bytes) ? (net[0].tx_bytes / MB).toFixed(2) : 0;

        const metricas = {
            cpuUso, cpuTemp, cpuFreq, cpuCarga, cpuCores, gpuUso, gpuMemUso, gpuTemp, ramUso, ramDisponible, swapUso, discoUso, discoRead, discoWrite, netIn, netOut
        };

        //debug
        console.log(`[${new Date().toLocaleTimeString()}] 
            CPU: ${metricas.cpuUso}% (${metricas.cpuFreq}GHz) | Carga: ${metricas.cpuCarga} | Temp: ${metricas.cpuTemp}ºC | Nº cores: ${metricas.cpuCores}
            GPU: ${metricas.gpuUso}% | VRAM: ${metricas.gpuMemUso}% | Temp: ${metricas.gpuTemp}ºC
            RAM: ${metricas.ramUso}% (Disp: ${metricas.ramDisponible}MB) | Swap: ${metricas.swapUso}%
            Disco: ${metricas.discoUso}% (R: ${metricas.discoRead}MB/s W: ${metricas.discoWrite}MB/s)
            Net: In ${metricas.netIn}MB Out ${metricas.netOut}MB`
        );

        //subida metricas
        await uploadData(metricas);

        return metricas;
        
    } catch(error){
        console.error("Error obteniendo métricas:", error.message);
    }
}

// carga db
const uploadData = async (data) => {
    try {
        const result = await pool.query(
            'INSERT INTO metricas_sistema (cpu_uso, cpu_temp, cpu_freq, cpu_carga, n_cores, gpu_uso, gpu_mem_uso, gpu_temp, ram_uso, ram_disponible, swap_uso, disco_uso, disco_read, disco_write, net_in, net_out) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)', 
            [data.cpuUso, data.cpuTemp, data.cpuFreq, data.cpuCarga, data.cpuCores, data.gpuUso, data.gpuMemUso, data.gpuTemp, data.ramUso, data.ramDisponible, data.swapUso, data.discoUso, data.discoRead, data.discoWrite, data.netIn, data.netOut]
        );

    } catch (error) {
        console.error('❌ Error guardando en DB:', error.message);
    }
};
