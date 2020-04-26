/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(
        'foursquare_lists',
        {
            user_id: {
                type: 'varchar(100)',
                notNull: true,
            },
            list_id: {
                type: 'varchar(300)',
                notNull: true,
            },
            city: {
                type: 'text',
            },
        },
        {
            constraints: {
                unique: ['user_id', 'list_id'],
            },
        },
    );
    pgm.createIndex('foursquare_lists', 'user_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('foursquare_lists');
}
