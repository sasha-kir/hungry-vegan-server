import db, { sql } from '../index';
import { FsqVenueDetails } from 'foursquare';
import { FsqApiListItem } from 'foursquare-api';

export const saveInitialData = async (
    userId: string | number,
    listId: string,
    itemsData: FsqApiListItem[],
): Promise<void> => {
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

export const getListVenues = async (
    userId: string | number,
    listId: string,
): Promise<VenueRecord[]> => {
    const venues = await db.many<VenueRecord>(sql`
        select * from list_venues
        where user_id = ${userId}
        and list_id = ${listId}
        order by venue_id desc
    `);
    return venues;
};

export const updateVenueDetails = async (
    venueDetails: FsqVenueDetails,
): Promise<VenueRecord | null> => {
    const venue = await db.transaction(async (trxConnection) => {
        const venue = await trxConnection.maybeOne<VenueRecord>(sql`
            update list_venues
            set instagram = ${venueDetails.instagram},
            only_delivery = ${venueDetails.onlyDelivery},
            only_takeaway = ${venueDetails.onlyTakeaway},
            maybe_closed = ${venueDetails.maybeClosed},
            updated_at = now()
            where venue_id = ${venueDetails.id}
            returning *
        `);
        if (venue) {
            await trxConnection.query(sql`
                update user_lists
                set updated_at = now()
                where list_id = ${venue.listId}
        `);
        }
        return venue;
    });

    return venue;
};
