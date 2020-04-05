/* eslint-disable @typescript-eslint/camelcase */
import { FsqApiList, FsqApiVenueLocation, FsqApiListItem } from 'foursquare';
import { FsqListData, FsqList, FsqListItem, FsqVenueLocation } from '../types';
import { foursquareApi } from '..';

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

export const getListData = async (accessToken: string, listId: string): Promise<FsqListData> => {
    const url = `lists/${listId}`;
    try {
        const { data } = await foursquareApi.get(url, {
            params: {
                oauth_token: accessToken,
                v: '20200220',
            },
        });
        const fullList: FsqApiList = data.response.list as FsqApiList;

        if (fullList.listItems.items === undefined) {
            return { data: null, error: 'no list items data found' };
        }

        const list: FsqList = {
            itemsCount: fullList.listItems.count,
            items: fullList.listItems.items.map(item => normalizeListItem(item)),
        };

        return { data: list, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
