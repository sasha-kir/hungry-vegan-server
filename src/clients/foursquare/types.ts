import { FsqApiUser, FsqApiList, FsqApiVenueLocation } from 'foursquare';

type Coordinates = { latitude: number; longitude: number };

export interface FsqVenueLocation extends Partial<FsqApiVenueLocation> {
    countryCode: string;
    coordinates: Coordinates;
}

export interface FsqListItem {
    id: string;
    name: string;
    addedAt: number;
    location: FsqVenueLocation;
}

export interface FsqList extends AtLeast<FsqApiList, 'id'> {
    itemsCount: number;
    items?: FsqListItem[];
}

export type FsqUser = Partial<FsqApiUser>;

export interface FsqListData {
    data: FsqList | null;
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
