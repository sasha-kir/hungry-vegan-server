import jwt from 'jsonwebtoken';

interface DecodeResponse {
    email: string | undefined;
    error?: string;
}

export const generateToken = (email: string): string => {
    const payload = {
        email,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, { algorithm: 'HS256', expiresIn: '1 day' });
    return token;
};

export const decodeToken = (token: string | undefined): DecodeResponse => {
    if (token === undefined) {
        return { email: undefined, error: 'empty token' };
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY, { algorithms: ['HS256'] });
        return { email: decoded['email'] };
    } catch (error) {
        return { email: undefined, error: error.message };
    }
};
