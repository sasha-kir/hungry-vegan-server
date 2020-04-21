/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('foursquare_lists', {
        list_id: {
            type: 'varchar(300)',
            notNull: true,
            unique: true,
        },
        city: {
            type: 'text',
        },
    });
    pgm.createIndex('foursquare_lists', 'list_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('foursqaue_lists');
}
