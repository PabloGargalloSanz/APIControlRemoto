import { logAll, logShell } from '../services/log.service.js';

export const activityLogger = (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const ip = req.ip || '0.0.0.0';
            let userId = req.userId || null;
            const rute = req.originalUrl;
            const method = req.method;
            let command= req.command;
            let action = req.action;
            const details = 'Acción realizada con exito';
            const statusCode = res.statusCode;

            if(!action){
                if(rute.includes('/api/metrics/status')){
                    action = 'MONITOREO_SISTEMA';
                    userId= '1';
                }  
            }
            
            //si la ruta viene de la shell
            if (rute,includes('/api/shell/execute')){
                logShell(userId, ip, rute, command, details, statusCode);
                next();

            } else{

                logAll(userId, action, ip, method, rute, details, statusCode);
            }
        } 
    });
    next();
};