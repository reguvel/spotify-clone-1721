import { BaseMedia } from "./media.interface";

export interface Album extends BaseMedia {
  type: 'album';
  songs: string[];
  year: string;
  length: number;
}