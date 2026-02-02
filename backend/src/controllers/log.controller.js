import { getLogErrorService } from '../services/log.service.js';

export const getLogError = async(req, res) =>{
    try {
        const logs = await getLogErrorService();

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
