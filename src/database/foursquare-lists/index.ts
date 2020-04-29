import { sql } from 'slonik';
import db from '../../database';
import { FsqList, FullFsqList } from 'foursquare';

export const saveInitialData = async (userId: string | number, listData: FsqList[]) => {
    const valuesList = listData.map(list => {
        const valuesTuple = sql.join([userId, list.id], sql`, `);
        return sql`(${valuesTuple})`;
    });
    await db.query(sql`
        insert into foursquare_lists (user_id, list_id) 
        values ${sql.join(valuesList, sql`, `)}
        on conflict do nothing
    `);
    return;
};

export const getListsData = async (userId: string | number) => {
    const lists = await db.many(sql`
        select * from foursquare_lists
        where user_id = ${userId}
        order by list_id desc
    `);
    return lists;
};

export const updateListCities = async (userId: string | number, listData: FullFsqList[]) => {
    const trxResult = await db.transaction(async trxConnection => {
        const updateQueries = listData.map(list =>
            trxConnection.query(sql`
                update foursquare_lists set city = ${list.city}
                where list_id = ${list.id} and user_id = ${userId}
            `),
        );
        const trxResult = await Promise.all(updateQueries);
        return trxResult;
    });
    console.log(trxResult);
    return trxResult;
};
