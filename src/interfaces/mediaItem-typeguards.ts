import { Album } from "./album.interface";
import { MediaItem } from "./mediaItem.interface";
import { Playlist } from "./playlist.interface";
import { Song } from "./song.interface";


export function isAlbum(item: MediaItem): item is Album {
  return item.type === 'album';
}

export function isPlaylist(item: MediaItem): item is Playlist {
  return item.type === 'playlist';
}

// export function isSong(item: MediaItem): item is Song {
//   return item.type === 'song';
// }