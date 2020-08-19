import { Response } from 'express';
import { CustomRequest, LoginPayload, RegisterPayload } from 'internal';
import * as AuthService from '../../services/auth-service';

export const handleLogin = async (
    req: CustomRequest<LoginPayload>,
    res: Response,
): Promise<Response> => {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
        return res.status(400).json({ error: 'missing required fields in request' });
    }
    try {
        const { data: token, error } = await AuthService.checkCredentials({ username, password });
        if (error !== null || token === null) {
            return res.status(401).json({ error });
        }
        return res.json({ token: token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const handleRegister = async (
    req: CustomRequest<RegisterPayload>,
    res: Response,
): Promise<Response> => {
    const { username, email, password } = req.body;
    if (username === undefined || email === undefined || password === undefined) {
        return res.status(400).json({ error: 'missing required fields in request' });
    }
    try {
        const { data: token, error } = await AuthService.registerUser({
            username,
            email,
            password,
        });
        if (error !== null || token === null) {
            return res.status(400).json({ error });
        }
        return res.json({ token: token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
