import { sql } from 'slonik';
import db from '..';

export const getTokenByFoursquareId = async (foursquareId: number) => {
    const tokenRecord = await db.maybeOne(sql`
        select * from access_tokens 
        where foursquare_id = ${foursquareId}
    `);
    return tokenRecord;
};
