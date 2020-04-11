/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('login');
}
