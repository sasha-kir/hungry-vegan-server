import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users', {
        id: {
            type: 'serial',
            notNull: true,
            primaryKey: true,
        },
        username: {
            type: 'varchar(100)',
            unique: true,
        },
        email: {
            type: 'varchar(300)',
            notNull: true,
            unique: true,
        },
        foursquare_id: {
            type: 'int',
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('users');
}
