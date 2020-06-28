import db, { sql } from '..';
import { FsqApiListItem } from 'foursquare-api';

export const saveInitialData = async (
    userId: string | number,
    listId: string,
    itemsData: FsqApiListItem[],
) => {
    const valuesList = itemsData.map((item) => {
        const valuesTuple = sql.join([userId, listId, item.venue.id, item.venue.name], sql`, `);
        return sql`(${valuesTuple})`;
    });
    await db.query(sql`
        insert into list_venues (user_id, list_id, venue_id, venue_name) 
        values ${sql.join(valuesList, sql`, `)}
        on conflict do nothing
    `);
    return;
};

export const getListVenues = async (userId: string | number, listId: string) => {
    const venues = await db.many(sql.VenueRecord`
        select * from list_venues
        where user_id = ${userId}
        and list_id = ${listId}
        order by venue_id desc
    `);
    return venues;
};
