import { sql } from 'slonik';
import db from '../../database';
import { getUserLists } from '../../clients/foursquare';
import { FsqList } from '../../clients/foursquare/types';

interface FullList extends FsqList {
    city: string;
}

interface FullListsData {
    data: FullList[] | null;
    error: string | null;
}

export const getFullListsData = async (accessToken: string): Promise<FullListsData> => {
    const { data, error } = await getUserLists(accessToken);
    if (error !== null || data === null) {
        return { data: null, error: error };
    }
    await db.query(sql`
        insert into foursquare_lists (user_id, list_id) 
        values ${sql.join(
            data.map(list => (list.id))
            [sql`(${sql.join([1, 2], sql`, `)})`, sql`(${sql.join([3, 4], sql`, `)})`],
            sql`, `,
        )}`);
};
