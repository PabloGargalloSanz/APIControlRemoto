import '../utils/envLoader.js';
import si from 'systeminformation';
import pool from '../db/db.js';

//debug
console.log("Contraseña cargada:", process.env.DB_PASSWORD ? "SÍ" : "NO");

// obtencion metricas
const getSystemMetrics = async () => {
    const [cpu, temp, mem, disk, net, gpu] = await Promise.all([
        si.currentLoad(),    // % CPU
        si.cpuTemperature(), // º CPU
        si.mem(),            // % RAM
        si.fsSize(),         // % Disco 
        si.networkStats(),   // Red 
        si.graphics()        // GPU
    ]);

    // CPU
    const cpuUso = cpu.currentLoad.toFixed(2);
    // Si WMI no está implementado en la placa, temp.main será 0
    const cpuTemp = (temp.main && temp.main > 0) ? temp.main.toFixed(1) : 0;

    // GPU
    const mainGpu = gpu.controllers && gpu.controllers.length > 0 ? gpu.controllers[0] : null;
    const gpuUso = mainGpu && mainGpu.utilizationGpu ? mainGpu.utilizationGpu : 0;
    const gpuTemp = mainGpu && mainGpu.temperatureGpu ? mainGpu.temperatureGpu : 0;
    const gpuMemUso = mainGpu && mainGpu.utilizationMemory ? mainGpu.utilizationMemory : 0;

    // calculo % de RAM
    const ramUso = (mem.total > 0) ? ((mem.active / mem.total) * 100).toFixed(2) : 0;

    // % primer disco detectado 
    const discoUso = disk[0] ? disk[0].use.toFixed(2) : 0;

    // mb
    const MB = 1024 * 1024;

    // Bytes recibidos (rx) y transmitidos (tx)
    const netIn = (net[0] && net[0].rx_bytes) ? (net[0].rx_bytes / MB).toFixed(2) : 0;
    const netOut = (net[0] && net[0].tx_bytes) ? (net[0].tx_bytes / MB).toFixed(2) : 0;

    return {
        cpuUso, cpuTemp, gpuUso, gpuMemUso, gpuTemp, ramUso, discoUso, netIn, netOut
    };
};

// carga db
const uploadData = async (data) => {
    try {
        const result = await pool.query(
            'INSERT INTO metricas_sistema (cpu_uso, cpu_temp, gpu_uso, "gpu_memUso", gpu_temp, ram_uso, disco_uso, net_in, net_out) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
            [data.cpuUso, data.cpuTemp, data.gpuUso, data.gpuMemUso, data.gpuTemp, data.ramUso, data.discoUso, data.netIn, data.netOut]
        );

    } catch (dbError) {
        console.error('❌ Error guardando en DB:', dbError.message);
    }
};

// obtencion y subida metricas
const collectMetrics = async () => {
    try {
        //obtencion
        const metrics = await getSystemMetrics();
        
        //subida
        await uploadData(metrics);
        
        //debug
        console.log(`[${new Date().toLocaleTimeString()}] CPU Use ${metrics.cpuUso}% Temp ${metrics.cpuTemp}º | GPU Use ${metrics.gpuUso}% ${metrics.gpuMemUso}% Temp ${metrics.gpuTemp}º | RAM ${metrics.ramUso}% | Disco ${metrics.discoUso}% | Net In ${metrics.netIn} MB | Net Out ${metrics.netOut} MB`);

    } catch (error) {
        console.error('❌ Error en el Worker de metricas:', error.message);
    }
};

// Inicio del worker debug
console.log(' Worker de metricas iniciado. Frecuencia: 1 minuto.');
collectMetrics();
setInterval(collectMetrics, 60000);