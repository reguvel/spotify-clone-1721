export interface RecentlyPlayed{
    name: string;
    mediaList: {
        type: 'album' | 'playlist';
        mediaId: string;
        addedAt: Date;
    }[];
}