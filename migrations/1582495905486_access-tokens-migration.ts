/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('access_tokens');
}
