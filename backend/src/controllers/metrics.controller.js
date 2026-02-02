import { getLogWarningMetricasService } from '../services/metrics.service.js';

export const getLogWarningsMetricas = async(req, res) =>{
    try {
        const logs = await getLogWarningMetricasService();

        return res.status(200).json({
            data: logs
        });
    } catch(error){
        return res.status(400).json({
            message: 'Error al obtener logs del servidor',
            error: error.message
        });
    }
}
