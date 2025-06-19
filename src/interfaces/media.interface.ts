import { Album } from "./album.interface";
import { MediaItem } from "./mediaItem.interface";
import { Playlist } from "./playlist.interface";
import { Song } from "./song.interface";




export interface BaseMedia {
  id: string;
  name: string;
  artist: string;
  img: string;
  liked: boolean;
  inLibrary: boolean;
}

