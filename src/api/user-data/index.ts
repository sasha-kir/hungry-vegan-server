import { Request, Response } from 'express';
import * as UserService from '../../services/user-service';

export const getUserData = async (req: Request, res: Response) => {
    try {
        const { user, error: dataError } = await UserService.getUser(req.user.email);
        if (dataError !== null || user === null) {
            return res.status(404).json({ error: dataError });
        }
        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateUserData = async (req: Request, res: Response) => {
    const currentEmail = req.user.email;
    const { username, email } = req.body;
    if (username === undefined || !email) {
        return res.status(400).json({ error: 'received invalid user data' });
    }
    try {
        const { user, error, token } = await UserService.updateUser(username, currentEmail, email);
        if (error !== null || user === null || token === undefined) {
            return res.status(404).json({ error });
        }
        return res.json({ user, token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
