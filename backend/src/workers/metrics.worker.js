import '../utils/envLoader.js';
import si from 'systeminformation';
import pool from '../db/db.js';

//debug
console.log("Contraseña cargada:", process.env.DB_PASSWORD ? "SÍ" : "NO");

// obtencion metricas
const getSystemMetrics = async () => {
    try{
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

        //////////////// CPU
        const cpuUso = cpuLoad.currentLoad.toFixed(2);

        // si la placa no tiene receptor temp = 0
        const cpuTemp = (tempRes.main && tempRes.main > 0) ? tempRes.main.toFixed(1) : 0;
        
        //frecuencia en ghz
        const cpuFreq = cpuInfo.speed;
        
        //promedio carga 1min
        const cpuCarga = (cpuLoad.avgLoad && cpuLoad.avgLoad.length > 0) ? cpuLoad.avgLoad[0] : 0;

        // n cores
        const cpuCores= cpuInfo.cores

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


        ///////////DISCO

        // % primer disco detectado 
        const discoUso = disk[0] ? disk[0].use.toFixed(2) : 0;
        
        // MB/s lectura
        const discoRead = dIO?.rIO_sec ? (dIO.rIO_sec / MB).toFixed(2) : 0;

        // MB/s escritura
        const discoWrite = dIO?.wIO_sec ? (dIO.wIO_sec / MB).toFixed(2) : 0; 

        ////////// RED Bytes recibidos (rx) y transmitidos (tx)
        const netIn = (net[0] && net[0].rx_bytes) ? (net[0].rx_bytes / MB).toFixed(2) : 0;
        const netOut = (net[0] && net[0].tx_bytes) ? (net[0].tx_bytes / MB).toFixed(2) : 0;

        const metricas = {
            cpuUso, cpuTemp, cpuFreq, cpuCarga, cpuCores, gpuUso, gpuMemUso, gpuTemp, ramUso, ramDisponible, swapUso, discoUso, discoRead, discoWrite, netIn, netOut
        };

        return metricas;
        
    } catch(error){
        error.action = 'METRICS_FETCH_FAILED';
        error.status = 500;
        //next(error);
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

        error.status = 500;
        error.action = 'UPLOAD_DB_FAIL';
        //next(error);
    }
};

// obtencion y subida metricas
const collectMetrics = async () => {
    try {
        //obtencion
        const metrics = await getSystemMetrics();
        
        //alertas
        const systemAlerts = checkWarnings(metrics);
        
        if (systemAlerts.length > 0) {
            try {
                for (const alert of systemAlerts) {
                    console.log(`[${alert.level.toUpperCase()}] ${alert.action}: ${alert.message}`);
                    
                    const result = await pool.query(
                        'INSERT INTO avisos (componente, tipo, valor) VALUES ($1, $2, $3)', 
                        [alert.action, alert.level, alert.valor]
                    );
                }

            } catch (error) {
                console.error('❌ Error guardando en DB:', error.message);

                error.status = 500;
                error.action = 'UPLOAD_DB_FAIL';
                //next(error);
            }
        }

        //subida
        await uploadData(metrics);
        
        //debug
        console.log(`[${new Date().toLocaleTimeString()}] 
            CPU: ${metrics.cpuUso}% (${metrics.cpuFreq}GHz) | Carga: ${metrics.cpuCarga} | Temp: ${metrics.cpuTemp}ºC | Nº cores: ${metrics.cpuCores}
            GPU: ${metrics.gpuUso}% | VRAM: ${metrics.gpuMemUso}% | Temp: ${metrics.gpuTemp}ºC
            RAM: ${metrics.ramUso}% (Disp: ${metrics.ramDisponible}MB) | Swap: ${metrics.swapUso}%
            Disco: ${metrics.discoUso}% (R: ${metrics.discoRead}MB/s W: ${metrics.discoWrite}MB/s)
            Net: In ${metrics.netIn}MB Out ${metrics.netOut}MB`
        );

    } catch (error) {
        console.error('❌ Error en el Worker de metricas:', error.message);

        error.action = 'WORKER_FATAL_ERROR';
        error.status = 500;
        //next(error);
    }
};

/////////// avisos
const checkWarnings = ( data) => {
    const alerts = [];
    const cores = data.cpuCores || 1; 

    const evaluar = (valor, aviso, critico, accionBase, unidad = '%') => {
        const val = parseFloat(valor);
        if (val > critico) {
            alerts.push({ 
                action: `${accionBase}_CRITICAL`, 
                status: 499, 
                level: 'danger', 
                valor,
                message: `${val}${unidad} supera el umbral crítico (${critico}${unidad})` 
            });

        } else if (val > aviso) {
            alerts.push({ 
                action: `${accionBase}_WARNING`, 
                status: 299, 
                level: 'warning', 
                valor,
                message: `${val}${unidad} supera el umbral de aviso (${aviso}${unidad})` 
            });
        }
    };

    // tabla
    evaluar(data.cpuUso, 80, 95, 'CPU_USAGE');
    evaluar(data.cpuTemp, 75, 90, 'CPU_TEMP', 'ºC');
    evaluar(data.gpuUso, 85, 98, 'GPU_USAGE');
    evaluar(data.gpuTemp, 80, 92, 'GPU_TEMP', 'ºC');
    evaluar(data.ramUso, 85, 95, 'RAM_USAGE');
    evaluar(data.swapUso, 10, 50, 'SWAP_USAGE');
    evaluar(data.discoUso, 85, 95, 'DISK_USAGE');

    // carga CPU
    const cargaVal = parseFloat(data.cpuCarga);
    
    //critico
    if (cargaVal > ( cores * 1.5)) {
        alerts.push({ 
            action: 'CPU_LOAD_CRITICAL', 
            status: 499, 
            level: 'danger', 
            valor,
            message: `Carga ${cargaVal} muy superior a los ${cores} núcleos` 
        });

        //aviso
    } else if (cargaVal > cores) {

        alerts.push({ 
            action: 'CPU_LOAD_WARNING', 
            status: 299, 
            level: 'warning', 
            valor,
            message: `Carga ${cargaVal} supera el número de núcleos (${cores})` 
        });
    }

    return alerts;
};


// Inicio del worker debug
console.log(' Worker de metricas iniciado. Frecuencia: 1 minuto.');
collectMetrics();
setInterval(collectMetrics, 60000);