import jwt from 'jsonwebtoken';

interface DecodeResponse {
    userId: number | undefined;
    error?: string;
}

export const generateToken = (userId: number): string => {
    const payload = {
        userId,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, { algorithm: 'HS256', expiresIn: '1 day' });
    return token;
};

export const decodeToken = (token: string | undefined): DecodeResponse => {
    if (token === undefined) {
        return { userId: undefined, error: 'empty token' };
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY, { algorithms: ['HS256'] });
        return { userId: decoded['userId'] };
    } catch (error) {
        return { userId: undefined, error: error.message };
    }
};
