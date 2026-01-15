import {createUser, authenticateUser} from '../services/auth.service.js';

//nuevo usuario
export const register = async (req, res) => {
    const { email, password } = req.body;   

    try {
        const newUser =  await createUser (email, password);
        res.status(201).json(newUser);

    } catch (error) {
        console.error('Error registering user:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: "El email ya está registrado" });
        }
        res.status(400).json({ error: error.message });
    }   
};

//autentificar usuario
export const loggin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (user) {
            const token = authService.generateToken(user);

            res.status(200).json({
                message: "Login exitoso",
                token: token,
                user: {
                    id: user.id,
                    email: user.email
                }
        });

        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

};