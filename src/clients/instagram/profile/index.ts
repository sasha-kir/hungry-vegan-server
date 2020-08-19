import { InstagramPost } from 'instagram';
import { instagramApi } from '..';

interface LastPostResponse {
    data: InstagramPost | null;
    error: string | null;
}

const normalizeData = (response): LastPostResponse => {
    const userData = response?.graphql?.user;
    if (!userData) {
        return { data: null, error: 'instagram profile not found' };
    }
    const userMediaData = userData['edge_owner_to_timeline_media'];
    const hasPhotos = userMediaData.count && userMediaData.count > 0;
    let lastPost: InstagramPost | null = null;
    if (hasPhotos) {
        const lastEdge = userMediaData.edges[0].node;
        lastPost = {
            date: lastEdge['taken_at_timestamp'],
        };
    }
    return { data: lastPost, error: null };
};

export const getLastPost = async (username: string): Promise<LastPostResponse> => {
    try {
        const { data } = await instagramApi.get(username, {
            params: {
                __a: 1,
            },
        });
        return normalizeData(data);
    } catch (error) {
        return { data: null, error: error.message };
    }
};
