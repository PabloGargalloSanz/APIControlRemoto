import {createUser, authenticateUser} from '../services/auth.service.js';
import {generateToken} from '../utils/token.util.js';
import {recentFailures, bloquearIp} from '../services/securityIp.service.js';


export const register = async (req, res, next) => {
    const { email, password, role } = req.body;   
    const rolType = role ? role : 'viewer';

    try {
        const newUser =  await createUser (email, password, rolType);
        
        req.action = 'REGISTER_SUCCESS'; 
        
        res.status(201).json(newUser);

    } catch (error) {
        if (error.code === '23505') {
            error.status = 409;
            error.message = "El email ya está registrado";
        }
        error.action = 'REGISTER_FAIL';
        next(error);
    }   
};


export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const ip = req.ip;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            const token = generateToken(user);

            req.userId = user.id; 
            req.action = 'LOGIN_SUCCESS';

            res.status(200).json({
                message: "Login exitoso",
                token: token,
                user: { id: user.id, email: user.email }
            });

        } else {
            const ipCountSearch = await recentFailures(ip);
            
            //si iguala o supera los intentos fallidos a 5 bloqueo de ip
            if(ipCountSearch >= 5){
                const action = 'LOGIN_COUNT_FAIL_EXCEDED';
                await bloquearIp(ip, action );

                const err = new Error('Demasiados intentos. IP bloqueada.');
                err.action = 'AUTH_IP_BLOCKED';
                err.status = 429;
                return next(err);
            }

            const err = new Error('Credenciales erroneas');
            err.action = 'AUTH_LOGIN_FAIL';
            err.status = 401;
            return next(err);
        }
        
    } catch (error) {
        error.status = 500;
        error.action = 'AUTH_LOGIN_BIG_FAIL';
        next(error);
    }
};