/* eslint-disable @typescript-eslint/camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('users', {
        id: 'id',
        username: {
            type: 'varchar(100)',
            notNull: true,
        },
        email: {
            type: 'varchar(300)',
            notNull: true,
            unique: true,
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
    pgm.createIndex('users', 'email');
};

exports.down = pgm => {
    pgm.dropTable('users');
};
