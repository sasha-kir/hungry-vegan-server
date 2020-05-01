import { FsqList, Coordinates } from 'foursquare';

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
