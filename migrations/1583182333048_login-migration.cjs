/* eslint-disable @typescript-eslint/camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('login', {
        id: 'id',
        email: {
            type: 'varchar(300)',
            notNull: true,
            unique: true,
        },
        password: {
            type: 'varchar(300)',
            notNull: true,
        },
    });
    pgm.createIndex('login', 'email');
};

exports.down = pgm => {
    pgm.dropTable('login');
};
