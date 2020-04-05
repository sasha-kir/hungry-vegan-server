export interface FsqApiVenueLocation {
    address: string;
    lat: number;
    lng: number;
    cc: string;
    city: string;
    country: string;
}

export interface FsqApiVenue {
    id: string;
    name: string;
    location: FsqApiVenueLocation;
}

export interface FsqApiListItem {
    id: string;
    createdAt: number;
    venue: FsqApiVenue;
}

export interface FsqApiListItems {
    count: number;
    items?: FsqApiListItem[];
}

export interface FsqApiList {
    id: string;
    name: string;
    url: string;
    canonicalUrl: string;
    createdAt: number;
    updatedAt: number;
    listItems: FsqApiListItems;
}

export interface FsqApiUserLists {
    count: number;
    items: FsqApiList[];
}

export interface FsqApiUser {
    id: string;
    firstName: string;
    birthday: number;
    homeCity: string;
    lists: FsqApiUserLists;
}
