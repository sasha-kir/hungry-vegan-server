import { Request, Response } from 'express';
import { AuthorizedRequest, TokenPayload } from 'internal';
import * as UserService from '../../services/user-service';

export const getUserData = async (req: AuthorizedRequest, res: Response) => {
    const { email } = req.user as TokenPayload;
    try {
        const { data: user, error: dataError } = await UserService.getUser(email);
        if (dataError !== null || user === null) {
            return res.status(404).json({ error: dataError });
        }
        return res.json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getUserLocation = async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'received invalid user coordinates' });
    }
    try {
        const { data: location, error } = await UserService.getUserLocation({
            latitude,
            longitude,
        });
        if (error !== null || location === null) {
            return res.status(500).json({ error });
        }
        return res.json({ location });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateUserData = async (req: AuthorizedRequest, res: Response) => {
    const { email: currentEmail } = req.user as TokenPayload;
    const { username, email } = req.body;
    if (username === undefined || !email) {
        return res.status(400).json({ error: 'received invalid user data' });
    }
    try {
        const { data: user, error, token } = await UserService.updateUser(
            username,
            currentEmail,
            email,
        );
        if (error !== null || user === null || token === undefined) {
            return res.status(404).json({ error });
        }
        return res.json({ user, token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
