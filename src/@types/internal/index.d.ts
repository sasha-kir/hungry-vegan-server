import { Request } from 'express';
import { FsqList, ListCoordinates } from 'foursquare';

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface CustomRequest<T> extends Request {
    body: T;
}

interface TokenPayload {
    email: string;
    iat: number;
    exp: number;
}

export interface AuthorizedRequest extends Request {
    user?: TokenPayload;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    email: string;
}

export interface OAuthPayload {
    code: string;
    redirectUrl: string;
}

export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

export interface FullList extends FsqList {
    location: string;
    coordinates: ListCoordinates | null;
}

export interface LocationMetaData {
    location: string;
    description: string;
    coordinates: ListCoordinates;
    countryCode: string;
}
