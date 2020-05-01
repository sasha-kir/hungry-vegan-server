import { setupTypeGen } from '@slonik/typegen';
import { knownTypes } from '../generated/db';
import { createPool } from 'slonik';
// import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';
import config from '../config';

const env = process.env.NODE_ENV || 'development';

export const { sql, poolConfig } = setupTypeGen({
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

const db = createPool(config[env].database, {
    typeParsers: poolConfig.typeParsers,
    interceptors: poolConfig.interceptors,
});

export default db;
