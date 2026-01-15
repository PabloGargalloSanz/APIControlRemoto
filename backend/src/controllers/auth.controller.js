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
            res.status(409);
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

            res.status(200).json({
                message: "Login exitoso",
                token: token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });

        // guardo id en req para uso posterior
        req.userId = user.id;
        req.action = 'LOGIN_SUCCES';

        } else {
            const err = new Error('Credenciales erroneas');
            err.status = 401;
            err.action = 'AUTH_LOGGIN_FAIL';
            return next(err);
        }

    } catch (error) {
        error.action = 'AUTH_LOGGIN_FAIL';
        next(error);
    }

};