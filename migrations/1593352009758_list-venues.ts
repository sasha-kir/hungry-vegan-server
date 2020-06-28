/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(
        'list_venues',
        {
            user_id: {
                type: 'varchar(100)',
                notNull: true,
            },
            list_id: {
                type: 'varchar(300)',
                notNull: true,
            },
            venue_id: {
                type: 'varchar(300)',
                notNull: true,
            },
            venue_name: {
                type: 'text',
                notNull: true,
            },
            instagram: {
                type: 'varchar(300)',
            },
            only_delivery: {
                type: 'boolean',
                default: false,
            },
            only_takeaway: {
                type: 'boolean',
                default: false,
            },
            updated_at: {
                type: 'timestamp',
                notNull: true,
                default: pgm.func('current_timestamp'),
            },
        },
        {
            constraints: {
                unique: ['list_id', 'venue_id'],
            },
        },
    );
    pgm.createIndex('list_venues', 'list_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('list_venues');
}
