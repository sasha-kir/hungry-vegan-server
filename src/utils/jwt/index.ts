import jwt from 'jsonwebtoken';

interface DecodeResponse {
    email: string | null;
    error: string | null;
}

export const generateToken = (email: string): string => {
    const payload = {
        email,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, {
        algorithm: 'HS256',
        expiresIn: '1 day',
    });
    return token;
};

export const decodeToken = (token: string): DecodeResponse => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY, { algorithms: ['HS256'] });
        return { email: decoded['email'], error: null };
    } catch (error) {
        return { email: null, error: error.message };
    }
};
