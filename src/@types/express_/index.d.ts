import { TokenPayload } from 'internal';

declare module 'express-serve-static-core' {
    interface Request {
        user: TokenPayload;
    }
}
