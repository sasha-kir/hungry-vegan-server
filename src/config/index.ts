require('dotenv').config();

interface Config {
    database: string;
}

const config: { [key: string]: Config } = {
    development: {
        database: process.env.DATABASE_URL,
    },
    test: {
        database: process.env.TEST_DATABASE_URL,
    },
};

export default config;