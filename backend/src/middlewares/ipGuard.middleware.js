import { ipBloqueada } from '../services/securityIp.service.js';

export const guardIpBlocked = async (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    const estaBaneada = await ipBloqueada(clientIp);

    if (estaBaneada) {
        console.log(`[SEGURIDAD] Intento de acceso desde IP bloqueada: ${clientIp}`);
        
        return setTimeout(() => {
            res.status(403).json({ 
                error: "Tu dirección IP ha sido bloqueada permanentemente por seguridad." 
            });
        }, 5000);
    }

    next(); 
};