import pool from '../db/db.js';
/////////// avisos

//guardar alertas
const alertCounters = {};

export const checkWarnings = ( data) => {
    const alerts = [];
    const cores = data.cpuCores || 1; 

    const evaluar = (valor, aviso, critico, accionBase, nombre, unidad = '%') => {
        const val = parseFloat(valor);

        if (!alertCounters[accionBase]) {
            alertCounters[accionBase] = 0;
        }

        // guardado avisos 
        if (val > aviso) {
            // si pasa el dato aviso aumenta contador
            alertCounters[accionBase]++;
            
            const esCritico = val > critico;
            
            // 3 fallos pasa a critico
            const tiempoNecesario = esCritico ? 1 : 3;

            if (alertCounters[accionBase] >= tiempoNecesario) {
                alerts.push({ 
                    action: `${accionBase}_${esCritico ? 'CRITICAL' : 'WARNING'}`, 
                    level: esCritico ? 'DANGER' : 'warning', 
                    valor: val,
                    message: `${nombre}: ${val}${unidad} `
                });
            }
        } else {
            // reset
            alertCounters[accionBase] = 0;
        }
    };

    // tabla
    evaluar(data.cpuUso, 80, 95, 'CPU_USAGE', 'Uso de CPU');
    evaluar(data.cpuTemp, 75, 90, 'CPU_TEMP', 'Temperatura de CPU', 'ºC');
    evaluar(data.gpuUso, 85, 98, 'GPU_USAGE', 'Uso de GPU');
    evaluar(data.gpuTemp, 80, 92, 'GPU_TEMP', 'Temperatura de GPU', 'ºC');
    evaluar(data.ramUso, 85, 95, 'RAM_USAGE', 'Uso de RAM');
    evaluar(data.swapUso, 10, 50, 'SWAP_USAGE', 'Uso de Swap');
    evaluar(data.discoUso, 85, 95, 'DISK_USAGE', 'Uso de Disco');
    evaluar(data.cpuCarga, cores, cores * 1.5, 'CPU_LOAD');

    return alerts;
};

export const uploadWarnings = async (alerts) => {
    if (alerts.length > 0) {
        try {
            for (const alert of alerts) {
                console.log(`[${alert.level.toUpperCase()}] ${alert.action}: ${alert.message}`);
                
                const result = await pool.query(
                    'INSERT INTO avisos (componente, tipo, valor) VALUES ($1, $2, $3)', 
                    [alert.action, alert.level, alert.valor]
                );
            }

        } catch (error) {
            console.error('❌ Error guardando en DB:', error.message);
        }
    }
}
    

