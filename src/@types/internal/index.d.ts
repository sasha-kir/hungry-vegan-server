import { Request } from 'express';
import { FsqList, Coordinates } from 'foursquare';

interface TokenPayload {
    email: string;
    iat: number;
    exp: number;
}

export interface CustomRequest<T> extends Request {
    body: T;
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

export interface FullList extends FsqList {
    location: string;
    coordinates: Coordinates | null;
}

export interface ListMetaData {
    location: string;
    coordinates: Coordinates;
    countryCode: string;
}
