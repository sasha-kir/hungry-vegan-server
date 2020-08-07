interface UserRecord {
    id: number;
    username: string;
    email: string;
    foursquareId: number | null;
    createdAt: number;
    updatedAt: number | null;
}

interface LoginRecord {
    id: number;
    email: string;
    password: string;
}

interface TokenRecord {
    id: number;
    foursquareId: number;
    accessToken: string;
    createdAt: number;
    updatedAt: number | null;
}

interface ListRecord {
    userId: number;
    listId: string;
    listName: string;
    location: string | null;
    lat: number | null;
    lon: number | null;
    updatedAt: number;
    isPublic: boolean;
}

type ListWithOwnerRecord = ListRecord & { owner: string };
type PublicListRecord = ListWithOwnerRecord & { itemsCount: number };

interface VenueRecord {
    userId: number;
    listId: string;
    venueId: string;
    venueName: string;
    instagram: string | null;
    onlyDelivery: boolean;
    onlyTakeaway: boolean;
    maybeClosed: boolean;
    updatedAt: number;
}
