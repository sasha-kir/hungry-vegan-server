import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(
        'user_lists',
        {
            user_id: {
                type: 'int',
                notNull: true,
                references: 'users(id)',
            },
            list_id: {
                type: 'varchar(300)',
                notNull: true,
            },
            list_name: {
                type: 'varchar(300)',
                notNull: true,
            },
            location: {
                type: 'text',
            },
            lat: {
                type: 'real',
            },
            lon: {
                type: 'real',
            },
            updated_at: {
                type: 'timestamp',
                notNull: true,
                default: pgm.func('current_timestamp'),
            },
            is_public: {
                type: 'boolean',
                default: false,
            },
        },
        {
            constraints: {
                unique: ['user_id', 'list_id'],
            },
        },
    );
    pgm.createIndex('user_lists', 'user_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable('user_lists');
}
