import jwt from 'express-jwt';

export const checkToken = () => {
    return jwt({
        secret: process.env.JWT_KEY,
        getToken: req => req.header('Authentication'),
    }).unless({ path: ['/oauth_id', /\/*login/, '/register'] });
};
