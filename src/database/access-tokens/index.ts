import db, { sql } from '../index';

export const getTokenByFoursquareId = async (foursquareId: number): Promise<TokenRecord | null> => {
    const tokenRecord = await db.maybeOne<TokenRecord>(sql`
        select * from access_tokens 
        where foursquare_id = ${foursquareId}
    `);
    return tokenRecord;
};
