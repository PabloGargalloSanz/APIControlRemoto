import { logError } from '../services/log.service.js';

export const globalErrorHandler = async (err, req, res, next) => {
    const ip = req.ip || '0.0.0.0'; //evitar posibles problemas insercion
    const userId = req.user ? req.user.id : null; // con token tenemos id
    const action = err.action || 'SYSTEM_ERROR'; 
    const rute = req.originalUrl;
    const method = req.method;

    logError(userId, action, ip, method, rute, err.message);
    
    console.error(`[${action}] - Error: ${err.message}`);

    res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor"
    });
};