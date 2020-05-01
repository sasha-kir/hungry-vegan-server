import db, { sql } from '..';
import { FsqList } from 'foursquare';
import { FullList } from 'internal';

export const saveInitialData = async (userId: string | number, listData: FsqList[]) => {
    const valuesList = listData.map(list => {
        const valuesTuple = sql.join([userId, list.id], sql`, `);
        return sql`(${valuesTuple})`;
    });
    await db.query(sql`
        insert into user_lists (user_id, list_id) 
        values ${sql.join(valuesList, sql`, `)}
        on conflict do nothing
    `);
    return;
};

export const getListsData = async (userId: string | number) => {
    const lists = await db.many(sql.ListRecord`
        select * from user_lists
        where user_id = ${userId}
        order by list_id desc
    `);
    return lists;
};

export const updateListLocations = async (userId: string | number, listData: FullList[]) => {
    const trxResult = await db.transaction(async trxConnection => {
        const updateQueries = listData.map(list =>
            trxConnection.query(sql`
                update user_lists set location = ${list.location}
                where list_id = ${list.id} and user_id = ${userId}
            `),
        );
        const trxResult = await Promise.all(updateQueries);
        return trxResult;
    });
    return trxResult;
};
