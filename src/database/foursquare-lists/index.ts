import { sql } from 'slonik';
import db from '../../database';
import { FsqList } from 'foursquare';

export const saveListsData = async (
    listData: FsqList[],
    userId: string | number,
): Promise<void> => {
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
