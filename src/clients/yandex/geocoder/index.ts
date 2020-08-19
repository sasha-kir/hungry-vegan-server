import { GeoObject } from 'yandex-api';
import { ListCoordinates } from 'foursquare';
import { LocationMetaData } from 'internal';
import { geocoderApi } from '..';

interface GeocoderResponse {
    data: LocationMetaData | null;
    error: string | null;
}

const normalizeResponse = (response): GeocoderResponse => {
    const results = response.GeoObjectCollection.featureMember;
    if (!results.length) {
        return { data: null, error: 'location not found' };
    }
    const geoObject: GeoObject = results[0].GeoObject;
    const [lon, lat] = geoObject.Point.pos.split(' ');
    const normalized = {
        location: geoObject.name,
        description: geoObject.description,
        coordinates: { latitude: Number(lat), longitude: Number(lon) },
        countryCode: geoObject.metaDataProperty.GeocoderMetaData.Address.country_code,
    };
    return { data: normalized, error: null };
};

export const getLocationCoords = async (location: string): Promise<GeocoderResponse> => {
    try {
        const query = location.split(' ').join('+');
        const { data } = await geocoderApi.get('', {
            params: {
                geocode: query,
                results: 1,
            },
        });
        return normalizeResponse(data.response);
    } catch (error) {
        return { data: null, error: error.message };
    }
};

export const getLocationName = async ({
    latitude,
    longitude,
}: ListCoordinates): Promise<GeocoderResponse> => {
    try {
        const query = [longitude, latitude].join(',');
        const { data } = await geocoderApi.get('', {
            params: {
                geocode: query,
                results: 1,
            },
        });
        return normalizeResponse(data.response);
    } catch (error) {
        return { data: null, error: error.message };
    }
};
