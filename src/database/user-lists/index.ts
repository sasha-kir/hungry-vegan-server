import db, { sql } from '..';
import { FsqList } from 'foursquare';
import { FullList } from 'internal';

export const saveInitialData = async (userId: string | number, listData: FsqList[]) => {
    const valuesList = listData.map((list) => {
        const listName = String(list.name).toLowerCase();
        const valuesTuple = sql.join([userId, listName, list.id], sql`, `);
        return sql`(${valuesTuple})`;
    });
    await db.query(sql`
        insert into user_lists (user_id, list_name, list_id) 
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

export const getPublicLists = async () => {
    const lists = await db.many(sql`
        select l.*, 
        (select count(*) as items_count 
        from list_venues v 
        where v.list_id = l.list_id)
        from user_lists l
        where l.is_public = true
    `);
    return lists;
};

export const getUserList = async (userId: string | number, listName: string) => {
    const list = await db.maybeOne(sql.ListRecord`
        select * from user_lists
        where user_id = ${userId}
        and list_name = ${listName}
    `);
    return list;
};

export const getListById = async (listId: string) => {
    const list = await db.maybeOne(sql.ListRecord`
        select * from user_lists
        where list_id = ${listId}
    `);
    return list;
};

export const updateListLocations = async (userId: string | number, listData: FullList[]) => {
    const trxResult = await db.transaction(async (trxConnection) => {
        const updateQueries = listData.map((list) => {
            const lat = list.coordinates ? list.coordinates.latitude : null;
            const lon = list.coordinates ? list.coordinates.longitude : null;
            return trxConnection.query(sql`
                update user_lists set location = ${list.location},
                lat = ${lat}, lon = ${lon}, updated_at = now()
                where list_id = ${list.id} and user_id = ${userId}
            `);
        });
        const trxResult = await Promise.all(updateQueries);
        return trxResult;
    });
    return trxResult;
};
