/* eslint-disable @typescript-eslint/camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('access_tokens', {
        id: 'id',
        foursquare_id: {
            type: 'int',
            notNull: true,
            unique: true,
        },
        access_token: {
            type: 'varchar(300)',
            notNull: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
        },
    });
    pgm.createIndex('access_tokens', 'foursquare_id');
};

exports.down = pgm => {
    pgm.dropTable('access_tokens');
};
