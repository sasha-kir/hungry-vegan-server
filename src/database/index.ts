import typegenDefault, * as typegenNamespace from '@slonik/typegen';
import slonikDefault, * as slonikNamespace from 'slonik';
import { knownTypes } from '../generated/db';

// import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';
import config from '../config';

const env = process.env.NODE_ENV || 'development';

const slonikTypegen = env === 'production' ? typegenDefault : typegenNamespace;
const slonik = env === 'production' ? slonikDefault : slonikNamespace;

export const { sql, poolConfig } = slonikTypegen.setupTypeGen({
    knownTypes,
    writeTypes: env !== 'production' && process.cwd() + '/src/generated/db',
});

// TODO: enable when slonik typegen is updated
// let interceptors = [
//     createFieldNameTransformationInterceptor({
//         format: 'CAMEL_CASE',
//     }),
// ];

// if (poolConfig.interceptors !== undefined) {
//     interceptors = [...interceptors, ...poolConfig.interceptors];
// }

const db = slonik.createPool(config[env].database, {
    typeParsers: poolConfig.typeParsers,
    interceptors: poolConfig.interceptors,
});

export default db;
