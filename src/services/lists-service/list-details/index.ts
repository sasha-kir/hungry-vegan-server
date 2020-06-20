/* eslint-disable @typescript-eslint/camelcase */
import { FsqList, FsqListItem, FsqVenueLocation } from 'foursquare';
import { FsqApiListItem, FsqApiVenueLocation } from 'foursquare-api';
import FoursquareClient from '../../../clients/foursquare';
import UserQuery from '../../../database/users';
import * as ListQuery from '../../../database/user-lists';
import { getAccessTokenFromDb } from '../../../utils/foursquare/accessToken';
import { ListResponse } from '..';

const normalizeLocation = (location: FsqApiVenueLocation): FsqVenueLocation => ({
    address: location.address,
    coordinates: { latitude: location.lat, longitude: location.lng },
    countryCode: location.cc,
    city: location.city,
    country: location.country,
});

const normalizeListItem = (item: FsqApiListItem): FsqListItem => {
    return {
        id: item.venue.id,
        name: item.venue.name,
        addedAt: item.createdAt,
        location: normalizeLocation(item.venue.location),
        instagram: null,
    };
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
    const { data, error } = await FoursquareClient.getListData(userToken, listData['list_id']);

    if (error !== null || data === null) {
        return { data: null, error: error, responseCode: 500 };
    }

    if (data.listItems.items === undefined) {
        return { data: null, error: 'no list items data found', responseCode: 404 };
    }

    const list: FsqList = {
        id: data.id,
        name: data.name,
        itemsCount: data.listItems.count,
        items: data.listItems.items.map(item => normalizeListItem(item)),
    };

    return { data: list, error: null, responseCode: 200 };
};
