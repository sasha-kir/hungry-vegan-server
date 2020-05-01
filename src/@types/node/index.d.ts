declare namespace NodeJS {
    export interface ProcessEnv {
        DATABASE_URL: string;
        TEST_DATABASE_URL: string;
        JWT_KEY: string;
        CRYPTUS_KEY: string;
        FOURSQUARE_CLIENT_ID: string;
        FOURSQUARE_CLIENT_SECRET: string;
        YANDEX_API_KEY: string;
    }
}
