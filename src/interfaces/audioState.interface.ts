import { Song } from "./song.interface";

export interface AudioState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  currentMedia: { type: 'album' | 'playlist'; id: string } | null;
  currentSongIndex: number;
  audio: HTMLAudioElement | null; // Store audio object
}

// import { WritableSignal } from "@angular/core";
// import { Song } from "./song.interface";

// export interface AudioState {
//   currentSong: WritableSignal<Song | null>;
//   queue: WritableSignal<Song[]>;
//   isPlaying: WritableSignal<boolean>;
//   volume: number;
//   currentMedia: WritableSignal<'album' |'playlist'>;
//   currentMediaId: WritableSignal<string>;
//   currentSongIndex: number;
//   currentSongUrl: WritableSignal<string>;
//   audio: HTMLAudioElement | null; 
// }