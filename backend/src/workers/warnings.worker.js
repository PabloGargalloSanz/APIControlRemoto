/////////// avisos

//guardar alertas
const alertCounters = {};

export const checkWarnings = ( data) => {
    const alerts = [];
    const cores = data.cpuCores || 1; 

    const evaluar = (valor, aviso, critico, accionBase, unidad = '%') => {
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
                    message: `${val}${unidad} supera el umbral ${esCritico ? 'critico' : 'de aviso'}`
                });
            }
        } else {
            // reset
            alertCounters[accionBase] = 0;
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
    evaluar(data.cpuCarga, cores, cores * 1.5, 'CPU_LOAD');
    
    return alerts;
};

