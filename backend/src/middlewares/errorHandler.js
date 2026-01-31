import { resourceLimits } from 'node:worker_threads';
import { logError } from '../services/log.service.js';

export const globalErrorHandler = async (err, req, res) => {
    const ip = req.ip || '0.0.0.0'; //evitar posibles problemas insercion
    const statusCode = err.status  || 500;
    const action = err.action || 'SYSTEM_ERROR'; 
    const rute = req.originalUrl;
    const method = req.method;
    const command = req.command;
    
    const userId = req.user; // con token tenemos id
    if(resourceLimits.includes('/shell/execute')){
        logErrorShell(userId, action, ip, method, rute, command, details, statusCode);

    }else{
        logError(userId, action, ip, method, rute, err.message, statusCode);
    }
    
    console.error(`[${action}] - Error: ${err.message}`);

    res.status(err.status || 500).json({
        error: err.message || "Error interno del servidor"
    });
};