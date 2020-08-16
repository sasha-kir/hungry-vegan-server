import dotenv from 'dotenv';
dotenv.config();

interface Config {
    database: string;
    port: number;
}

const config: { [key: string]: Config } = {
    development: {
        database: process.env.DATABASE_URL,
        port: 5000,
    },
    test: {
        database: process.env.TEST_DATABASE_URL,
        port: 5000,
    },
    production: {
        database: process.env.DATABASE_URL,
        port: 5000,
    },
};

export default config;
