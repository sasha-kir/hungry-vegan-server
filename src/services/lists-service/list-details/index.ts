/* eslint-disable @typescript-eslint/camelcase */
import { FsqList, FsqListItem, FsqVenueLocation } from 'foursquare';
import { FsqApiListItem, FsqApiVenueLocation } from 'foursquare-api';
import FoursquareClient from '../../../clients/foursquare';
import { getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
import { ListResponse } from '..';

const normalizeLocation = (location: FsqApiVenueLocation): FsqVenueLocation => ({
    address: location.address,
    coordinates: { latitude: location.lat, longitude: location.lng },
    countryCode: location.cc,
    city: location.city,
    country: location.country,
});

const normalizeListItem = (item: FsqApiListItem): FsqListItem => ({
    id: item.venue.id,
    name: item.venue.name,
    addedAt: item.createdAt,
    location: normalizeLocation(item.venue.location),
});

export const getListDetails = async (
    email: string,
    listId: string,
): Promise<ListResponse<FsqList>> => {
    const userToken = await getAccessTokenFromDb(email);
    if (userToken === null) {
        return { data: null, error: 'user has no associated foursquare id', responseCode: 400 };
    }
    const { data, error } = await FoursquareClient.getListData(userToken, listId);

    if (error !== null || data === null) {
        return { data: null, error: error, responseCode: 500 };
    }

    const list: FsqList = {
        id: data.id,
        itemsCount: data.listItems.count,
        items: data.listItems.items?.map(item => normalizeListItem(item)),
    };

    return { data: list, error: null, responseCode: 200 };
};
