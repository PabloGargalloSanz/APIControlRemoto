import { logAuth } from '../services/log.service.js';

export const activityLogger = (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const ip = req.ip || '0.0.0.0';
            const userId = req.user ? req.user.id : null;
            const rute = req.originalUrl;
            const method = req.method;
            const action = req.action;
            const details = `Acción realizada con éxito`;

            logAuth(userId, action, ip, method, rute, details);
        }
    });
    next();
};