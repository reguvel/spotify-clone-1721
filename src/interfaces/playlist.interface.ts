import { BaseMedia } from "./media.interface";


export interface Playlist extends BaseMedia {
    type: 'playlist';
    songs: {
      songId: string;
      dateAdded: string;
  }[];
  year: number;
  description: string;
  }
