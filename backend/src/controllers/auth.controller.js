import {createUser, authenticateUser} from '../services/auth.service.js';

//nuevo usuario
export const register = async (req, res) => {
    const { email, password } = req.body;   
    
    try {
        const newUser =  await createUser (email, password);
        res.status(201).json(newUser);

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message });
    }   
};