// src/utils/metricsFormatter.js

export const formatMetrics = (raw) => {
    const netVelocity = 1000;
    const diskVelocity = 2600;
    const ramTotal = 16; // GB

    return {
        cpu: { val: raw.cpuUso, percent: raw.cpuUso, unit: '%' },
        cpuTemp: { val: raw.cpuTemp.toFixed(1), percent: raw.cpuTemp, unit: 'ºC' },
        cpuCarga: { val: raw.cpuCarga.toFixed(2), percent: (raw.cpuCarga / raw.cpuCores) * 100, unit: '' },
        
        ram: { 
            val: raw.ramDisponible, 
            percent: (raw.ramDisponible / ramTotal) * 100, 
            unit: ' GB'
        },
        ramUso: { val: raw.ramUso, percent: raw.ramUso, unit: '%' },
        swapUso: { val: raw.swapUso.toFixed(2), percent: raw.swapUso, unit: '%' },
        discoUso: { val: raw.discoUso.toFixed(1), percent: raw.discoUso, unit: '%' },
        diskRead: formatUnit(raw.discoRead, diskVelocity, 'MB/s'),
        diskWrite: formatUnit(raw.discoWrite, diskVelocity, 'MB/s'),
        netIn: formatUnit(raw.netIn, netVelocity, 'MB/s'),
        netOut: formatUnit(raw.netOut, netVelocity, 'MB/s')
    };
};

function formatUnit(value, limit, baseUnit) {
    const val = parseFloat(value) || 0;
    const percent = Math.min((val / limit) * 100, 100);
    
    if (val < 1 && val > 0) {
        return { val: (val * 1024).toFixed(2), percent, unit: ' KB/s' };
    }
    return { val: val.toFixed(2), percent, unit: ` ${baseUnit}`};
}