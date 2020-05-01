import db, { sql } from '..';

export const getTokenByFoursquareId = async (foursquareId: number) => {
    const tokenRecord = await db.maybeOne(sql.TokenRecord`
        select * from access_tokens 
        where foursquare_id = ${foursquareId}
    `);
    return tokenRecord;
};
