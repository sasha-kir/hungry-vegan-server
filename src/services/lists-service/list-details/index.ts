import { FsqList, FsqListItem, FsqVenueLocation, FsqVenueDetails } from 'foursquare';
import { FsqApiListItem, FsqApiVenueLocation } from 'foursquare-api';
import FoursquareClient from '../../../clients/foursquare';
import UserQuery from '../../../database/users';
import * as ListQuery from '../../../database/user-lists';
import * as VenuesQuery from '../../../database/list-venues';
import { ListResponse } from '..';

const normalizeLocation = (location: FsqApiVenueLocation): FsqVenueLocation => ({
    address: location.address,
    coordinates: { latitude: location.lat, longitude: location.lng },
    countryCode: location.cc,
    city: location.city,
    country: location.country,
});

const normalizeItems = async (
    userId: string | number,
    listId: string,
    items: FsqApiListItem[],
): Promise<FsqListItem[]> => {
    const sortedData = items.sort((a, b) => b.venue.id.localeCompare(a.venue.id));
    const dbData = await VenuesQuery.getListVenues(userId, listId);
    const dbDataMap = dbData.reduce((result: { [key: string]: VenueRecord }, data) => {
        const venueId = data.venueId;
        return {
            ...result,
            [venueId]: data,
        };
    }, {});
    const normalized = sortedData.map((item) => {
        const venueId = item.venue.id;
        const dbDetails = dbDataMap[venueId];
        const location = normalizeLocation(item.venue.location);
        return {
            id: venueId,
            name: item.venue.name,
            addedAt: item.createdAt,
            location: location,
            coordinates: location.coordinates,
            updatedAt: dbDetails.updatedAt,
            instagram: dbDetails.instagram,
            onlyDelivery: dbDetails.onlyDelivery,
            onlyTakeaway: dbDetails.onlyTakeaway,
            maybeClosed: dbDetails.maybeClosed,
        };
    });
    return normalized;
};

export const getListDetails = async (
    username: string,
    listName: string,
): Promise<ListResponse<FsqList>> => {
    const user = await UserQuery.getUserByUsername(username);
    if (user === null) {
        return { data: null, error: 'user data not found', responseCode: 404 };
    }
    const listData = await ListQuery.getUserList(user.id, listName);
    if (listData === null) {
        return { data: null, error: 'list data not found', responseCode: 404 };
    }

    const { lat, lon } = listData;
    const listCoords = lat && lon ? { latitude: lat, longitude: lon } : null;

    const { data, error } = await FoursquareClient.getListData(listData.listId);

    if (error !== null || data === null) {
        return { data: null, error: error, responseCode: 500 };
    }

    const listItems = data?.listItems?.items;
    if (listItems === undefined) {
        return { data: null, error: 'no list items data found', responseCode: 404 };
    }
    await VenuesQuery.saveInitialData(user.id, data.id, listItems);

    const normalizedItems = await normalizeItems(user.id, data.id, listItems);

    const list: FsqList = {
        id: data.id,
        name: data.name,
        coordinates: listCoords,
        itemsCount: data.listItems.count,
        items: normalizedItems,
    };

    return { data: list, error: null, responseCode: 200 };
};

export const updateVenueDetails = async (
    newDetails: FsqVenueDetails,
): Promise<ListResponse<FsqList>> => {
    const updatedVenue = await VenuesQuery.updateVenueDetails(newDetails);
    if (!updatedVenue) {
        return { data: null, error: 'venue update unsuccessful', responseCode: 500 };
    }
    const listData = await ListQuery.getListById(updatedVenue.listId);
    if (!listData) {
        return { data: null, error: 'list data not found', responseCode: 404 };
    }
    return await getListDetails(listData.owner, listData.listName);
};
