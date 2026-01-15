import {createUser, authenticateUser} from '../services/auth.service.js';
import {generateToken} from '../utils/token.util.js';

//nuevo usuario
export const register = async (req, res, next) => {
    const { email, password } = req.body;   

    try {
        const newUser =  await createUser (email, password);
        req.action = 'REGISTER_SUCCESS';
        res.status(201).json(newUser);

    } catch (error) {
        console.error('Error registering user:', error);

        if (error.code === '23505') {
            error.status = 409;
            error.message = "El email ya está registrado";
        }
        error.action = 'REGISTER_FAIL';
        next(error);
    }   
};

//autentificar usuario
export const loggin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            const token = generateToken(user);

            // guardo id en req para uso posterior
            req.userId = user.id;
            req.action = 'LOGIN_SUCCES';

            res.status(200).json({
                message: "Login exitoso",
                token: token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });

        } else {
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