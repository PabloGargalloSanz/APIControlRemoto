import jwt from 'jsonwebtoken';

//verificar token
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        const err = new Error('Token no proporcionado');
        err.status = 401;
        err.action = 'TOKEN_MISSING';
        return next(err);
    }

    try {
        // decodificar
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = decoded.id; 
        
        next();
    } catch (error) {
        error.action = 'TOKEN_VERIFY_FAIL';
        next(error);
    }
};