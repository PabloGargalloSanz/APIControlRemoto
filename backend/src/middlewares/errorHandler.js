import { logError, logErrorShell } from '../services/log.service.js';

export const globalErrorHandler = async (err, req, res, next) => {
    const ip = req.ip || '0.0.0.0';
    const statusCode = err.status || 500;
    const action = err.action || 'SYSTEM_ERROR'; 
    const route = req.originalUrl;
    const method = req.method;
    const command = req.body?.command;
    const userId = req.userId; 
    
    try {
        if (route.includes('/api/shell/execute')) {
            const details = err.message || 'Error en ejecución de shell';
            
            logErrorShell(userId, action, ip, method, route, command, details, statusCode);
        } else {
            logError(userId, action, ip, method, route, err.message, statusCode);
        }
    } catch (logErr) {
        console.error('Error crítico guardando log de error:', logErr.message);
    }
    
    console.error(`[${action}] - RUTA: ${route} - Error: ${err.message}`);

    res.status(statusCode).json({
        success: false,
        error: err.message || "Error interno del servidor",
        action: action
    });
};