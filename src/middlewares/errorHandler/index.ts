export const handleUnauthorized = () => {
    return (err, _req, res, _) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).json({ error: 'invalid auth token' });
        }
    };
};
