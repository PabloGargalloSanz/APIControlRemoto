import { logAll, logShell } from '../services/log.service.js';

export const activityLogger = (req, res, next) => {
    //interceptar res.json
    const originalJson = res.json;
    res.json = function (body) {
        res.locals.responseBody = body;
        return originalJson.call(this, body);
    };

    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            
            const ip = req.ip || '0.0.0.0';
            const method = req.method;
            const route = req.originalUrl; 
            const statusCode = res.statusCode;
            let userId = req.userId;

            if (route.includes('/api/shell/execute')) {
                const command = req.body.command; 

                const details = 'Acción realizada con exito';
                logShell(userId, ip, route, command, details, statusCode);
            
            } else {
                let action = req.action || `HTTP_${method}`;
                let finalUserId = userId;
                if(route.includes('/api/metrics/status') && !req.action){
                    action = 'MONITOREO_SISTEMA';
                    finalUserId = '1';

                }else{
                    const details = 'Acción realizada con éxito';
                    logAll(finalUserId, action, ip, method, route, details, statusCode);
                }
            }
        }
    });

    next(); 
};