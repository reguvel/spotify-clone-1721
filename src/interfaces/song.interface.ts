import { BaseMedia } from "./media.interface";

export interface Song extends BaseMedia {
  type: 'song';
  url: string;
  duration: string;
  albumId: string;
  albumName: string;
}