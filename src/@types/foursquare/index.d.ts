import { FsqApiUser, FsqApiList, FsqApiVenueLocation } from 'foursquare-api';
import { AtLeast } from 'internal';

export type ListCoordinates = { latitude: number; longitude: number };

export interface FsqVenueLocation extends Partial<FsqApiVenueLocation> {
    countryCode: string;
    coordinates: ListCoordinates;
}

export interface FsqVenueDetails {
    id: string;
    instagram: string | null;
    onlyDelivery: boolean;
    onlyTakeaway: boolean;
    maybeClosed: boolean;
}

export interface FsqListItem extends FsqVenueDetails {
    name: string;
    addedAt: number;
    updatedAt: number;
    location: FsqVenueLocation;
    coordinates: ListCoordinates;
}

export interface FsqList extends AtLeast<FsqApiList, 'id' | 'name'> {
    itemsCount: number;
    owner: string;
    coordinates: ListCoordinates | null;
    items?: FsqListItem[];
}

export type FsqUser = Partial<FsqApiUser>;

export interface FsqListData {
    data: FsqApiList | null;
    error: string | null;
}

export interface FsqUserListsData {
    data: FsqList[] | null;
    error: string | null;
}

export interface FsqUserData {
    user: FsqUser | null;
    error: string | null;
}
