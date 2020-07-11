/* eslint-disable @typescript-eslint/camelcase */
import { FsqList, FsqListItem, FsqVenueLocation, FsqVenueDetails } from 'foursquare';
import { FsqApiListItem, FsqApiVenueLocation } from 'foursquare-api';
import FoursquareClient from '../../../clients/foursquare';
import UserQuery from '../../../database/users';
import * as ListQuery from '../../../database/user-lists';
import * as VenuesQuery from '../../../database/list-venues';
import { getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
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
    const dbVenuesData = await VenuesQuery.getListVenues(userId, listId);
    const normalized = sortedData.map((item, i) => {
        const { instagram, only_delivery, only_takeaway, maybe_closed, updated_at } = dbVenuesData[
            i
        ];
        const location = normalizeLocation(item.venue.location);
        return {
            id: item.venue.id,
            name: item.venue.name,
            addedAt: item.createdAt,
            updatedAt: +updated_at,
            location: location,
            coordinates: location.coordinates,
            instagram: instagram ? String(instagram) : null,
            onlyDelivery: Boolean(only_delivery),
            onlyTakeaway: Boolean(only_takeaway),
            maybeClosed: Boolean(maybe_closed),
        };
    });
    return normalized;
};

export const getListDetails = async (
    email: string,
    listName: string,
): Promise<ListResponse<FsqList>> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        return { data: null, error: 'user has no associated foursquare id', responseCode: 400 };
    }
    const user = await UserQuery.getUserByEmail(email);
    if (user === null) {
        return { data: null, error: 'user data not found', responseCode: 404 };
    }
    const listData = await ListQuery.getUserList(user.id, listName);
    if (listData === null) {
        return { data: null, error: 'list data not found', responseCode: 404 };
    }

    const { lat, lon } = listData;
    const listCoords = lat && lon ? { latitude: Number(lat), longitude: Number(lon) } : null;

    const { data, error } = await FoursquareClient.getListData(userToken, listData['list_id']);

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
    email: string,
    newDetails: FsqVenueDetails,
): Promise<ListResponse<FsqList>> => {
    const updatedVenue = await VenuesQuery.updateVenueDetails(newDetails);
    if (!updatedVenue) {
        return { data: null, error: 'venue update unsuccessful', responseCode: 500 };
    }
    const listData = await ListQuery.getListById(String(updatedVenue['list_id']));
    if (!listData) {
        return { data: null, error: 'list dat not found', responseCode: 404 };
    }
    return await getListDetails(email, String(listData['list_name']));
};
