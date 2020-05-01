interface Point {
    pos: string;
}

interface Address {
    country_code: string;
    formatted: string;
}

interface GeocoderMetaData {
    precision: string;
    text: string;
    kind: string;
    Address: Address;
    AddressDetails: object;
}
interface GeoObjectMetaData {
    GeocoderMetaData: GeocoderMetaData;
}

export interface GeoObject {
    metaDataProperty: GeoObjectMetaData;
    name: string;
    description: string;
    boundedBy: object;
    Point: Point;
}
