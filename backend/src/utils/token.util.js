import jwt from 'jsonwebtoken';

const JWT = process.env.JWT_SECRET;

//generar token
export const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email
    };

    return jwt.sign(payload, JWT, {
        expiresIn: '15m'
    })
}

