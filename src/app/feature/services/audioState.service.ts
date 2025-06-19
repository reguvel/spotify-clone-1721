
// import { Injectable, OnDestroy, WritableSignal } from '@angular/core';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { switchMap, tap, catchError } from 'rxjs/operators';
// import { Song } from '../../../interfaces/song.interface';
// import { SongsService } from './songs.service';
// import { RecentlyPlayedService } from './recently-played.service';

// export interface AudioState {
//   currentSong: Song | null;
//   queue: Song[];
//   isPlaying: boolean;
//   volume: number;
//   currentMedia: { type: 'album' | 'playlist'; id: string } | null;
//   currentSongIndex: number;
//   audio: HTMLAudioElement | null; // Store audio object
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AudioStateService implements OnDestroy {
//   private state: AudioState = {
//     currentSong: null,
//     queue: [],
//     isPlaying: false,
//     volume: 0.5,
//     currentMedia: null,
//     currentSongIndex: -1,
//     audio: null
//   };
//   private state$ = new BehaviorSubject<AudioState>(this.state);
//   private currentLoadingSongId: string | null = null; // Track loading song to prevent race conditions
//   private pendingPlayRequest: { song: Song; mediaType?: 'album' | 'playlist'; mediaId?: string } | null = null; // Queue play requests

//   constructor(
//     private songsService: SongsService,
//     private recentlyPlayedService: RecentlyPlayedService
//   ) {
//     // Load volume from localStorage if available
//     // const savedVolume = localStorage.getItem('volume');
//     // if (savedVolume) {
//     //   this.state.volume = parseFloat(savedVolume);
//     // }
//   }

//   // Get the current audio state as an observable
//   getState(): Observable<AudioState> {
//     return this.state$.asObservable();
//   }

//   // Play an individual song
//   playSong(song: Song, albumId?: string, playlistId?: string): void {
//     if (this.currentLoadingSongId) {
//       // Queue the play request if another song is loading
//       this.pendingPlayRequest = { song, mediaType: albumId ? 'album' : playlistId ? 'playlist' : undefined, mediaId: albumId || playlistId };
//       this.stopCurrentAudio();
//       return;
//     }

//     this.clearQueue();
//     this.state.queue = [song];
//     this.state.currentSong = song;
//     this.state.currentSongIndex = 0;
//     this.state.currentMedia = albumId
//       ? { type: 'album', id: albumId }
//       : playlistId
//       ? { type: 'playlist', id: playlistId }
//       : null;

//     this.loadAndPlaySong(song);
//     this.updateRecentlyPlayed();
//     this.updateState();
//   }

//   // Play all songs from an album or playlist
//   playMedia(mediaType: 'album' | 'playlist', mediaId: string, startSongId?: string): Observable<void> {
//     if (this.currentLoadingSongId) {
//       // Queue the play request
//       this.pendingPlayRequest = { song: null as any, mediaType, mediaId };
//       this.stopCurrentAudio();
//       return of(void 0);
//     }

//     return this.songsService
//       .getSongsbyAlbumIdOrPlaylistId(mediaType, mediaId)
//       .pipe(
//         tap(songs => {
//           if (!songs || songs.length === 0) {
//             console.error('No songs found for', mediaType, mediaId);
//             this.clearQueue();
//             this.updateState();
//             return;
//           }

//           this.state.queue = songs;
//           this.state.currentMedia = { type: mediaType, id: mediaId };

//           let startIndex = 0;
//           if (startSongId) {
//             startIndex = songs.findIndex(song => song.id === startSongId);
//             if (startIndex === -1) startIndex = 0;
//           }

//           this.state.currentSongIndex = startIndex;
//           this.state.currentSong = songs[startIndex];
//           this.loadAndPlaySong(songs[startIndex]);
//           this.updateRecentlyPlayed();
//           this.updateState();
//         }),
//         catchError(err => {
//           console.error('Error loading songs:', err);
//           this.clearQueue();
//           this.updateState();
//           return of(void 0);
//         }),
//         switchMap(() => of(void 0))
//       );
//   }

//   // Toggle play/pause
//   togglePlayPause(): void {
//     if (!this.state.audio) return;

//     if (this.state.isPlaying) {
//       this.state.audio.pause();
//       this.state.isPlaying = false;
//     } else {
//       this.state.audio.play().catch(err => {
//         console.error('Playback failed:', err);
//         this.state.isPlaying = false;
//       });
//       this.state.isPlaying = true;
//     }
//     this.updateState();
//   }

//   // Play next song in the queue
//   playNext(): void {
//     if (this.state.currentSongIndex + 1 < this.state.queue.length) {
//       this.state.currentSongIndex++;
//       this.state.currentSong = this.state.queue[this.state.currentSongIndex];
//       this.loadAndPlaySong(this.state.currentSong);
//       this.updateRecentlyPlayed();
//       this.updateState();
//     } else {
//       this.stopPlayback();
//     }
//   }

//   // Play previous song in the queue
//   playPrevious(): void {
//     if (this.state.currentSongIndex > 0) {
//       this.state.currentSongIndex--;
//       this.state.currentSong = this.state.queue[this.state.currentSongIndex];
//       this.loadAndPlaySong(this.state.currentSong);
//       this.updateRecentlyPlayed();
//       this.updateState();
//     } else if (this.state.audio) {
//       this.state.audio.currentTime = 0;
//       this.state.audio.play().catch(err => console.error('Playback failed:', err));
//     }
//   }

//   // Set volume (0 to 1)
//   setVolume(volume: number): void {
//     this.state.volume = Math.max(0, Math.min(1, volume));
//     if (this.state.audio) {
//       this.state.audio.volume = this.state.volume;
//     }
//     localStorage.setItem('volume', this.state.volume.toString());
//     this.updateState();
//   }

//   // Seek to a specific time
//   seekTo(time: number): void {
//     if (this.state.audio && this.state.currentSong) {
//       this.state.audio.currentTime = time;
//       this.updateState();
//     }
//   }

//   // Private helper methods
//   private loadAndPlaySong(song: Song): void {
//     if (!song.url) {
//       console.error('No URL provided for song:', song.name);
//       this.playNext();
//       return;
//     }

//     this.currentLoadingSongId = song.id;
//     this.stopCurrentAudio();

//     // Create new audio element
//     const audio = new Audio(song.url);
//     audio.volume = this.state.volume;
//     this.state.audio = audio;

//     // Add event listeners
//     const onCanPlay = () => {
//       if (this.currentLoadingSongId === song.id) {
//         audio.play().then(() => {
//           this.state.isPlaying = true;
//           this.currentLoadingSongId = null;
//           this.updateState();
//           // Process pending play request if any
//           this.processPendingPlayRequest();
//         }).catch(err => {
//           console.error('Playback failed:', err);
//           this.state.isPlaying = false;
//         //   this.currentLoadingSongId = null;
//           this.updateState();
//           this.playNext();
//         });
//       }
//       audio.removeEventListener('canplay', onCanPlay);
//     };

//     audio.addEventListener('canplay', onCanPlay);
//     audio.addEventListener('ended', () => this.playNext());
//     audio.addEventListener('error', () => this.handleAudioError());
//     audio.addEventListener('timeupdate', () => this.updateTime());

//     // Load the audio
//     audio.load();
//   }

//   private updateTime(): void {
//     // Throttle time updates to once per second to reduce state emissions
//     if (this.state.audio) {
//       const now = Date.now();
//       if (!this.lastTimeUpdate || now - this.lastTimeUpdate >= 1000) {
//         this.lastTimeUpdate = now;
//         this.updateState();
//       }
//     }
//   }

//   private lastTimeUpdate: number | null = null;

//   private handleAudioError(): void {
//     console.error('Audio error for song:', this.state.currentSong?.name);
//     this.currentLoadingSongId = null;
//     this.playNext();
//   }

//   private stopCurrentAudio(): void {
//     if (this.state.audio) {
//       this.state.audio.pause();
//       this.state.audio.src = '';
//       this.state.audio = null;
//       this.state.isPlaying = false;
//     }
//   }

//   private clearQueue(): void {
//     this.state.queue = [];
//     this.state.currentSong = null
//     this.state.currentSongIndex = -1;
//     this.state.currentMedia = null;
//     this.stopCurrentAudio();
//   }

//   private stopPlayback(): void {
//     this.clearQueue();
//     this.currentLoadingSongId = null;
//     this.pendingPlayRequest = null;
//     this.updateState();
//   }

//   private processPendingPlayRequest(): void {
//     if (this.pendingPlayRequest) {
//       const { song, mediaType, mediaId } = this.pendingPlayRequest;
//       this.pendingPlayRequest = null;
//       if (song) {
//         this.playSong(song, mediaType === 'album' ? mediaId : undefined, mediaType === 'playlist' ? mediaId : undefined);
//       } else if (mediaType && mediaId) {
//         this.playMedia(mediaType, mediaId).subscribe();
//       }
//     }
//   }

//   private updateRecentlyPlayed(): void {
//     if (this.state.currentMedia) {
//       this.recentlyPlayedService
//         .addToRecentlyPlayed(this.state.currentMedia.type, this.state.currentMedia.id)
//         .subscribe();
//     }
//   }

//   private updateState(): void {
//     this.state$.next({ ...this.state });
//   }

//   ngOnDestroy(): void {
//     this.stopPlayback();
//     this.state$.complete();
//   }
// }
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, tap, catchError, debounceTime } from 'rxjs/operators';
import { Song } from '../../../interfaces/song.interface';
import { RecentlyPlayedService } from './recently-played.service';
import { SongsService } from './songs.service';


export interface AudioState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  currentMedia: { type: 'album' | 'playlist'; id: string } | null;
  currentSongIndex: number;
  audio: HTMLAudioElement | null;
}

@Injectable({
  providedIn: 'root'
})
export class AudioStateService implements OnDestroy {
  private state: AudioState = {
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 0.5,
    currentMedia: null,
    currentSongIndex: -1,
    audio: null
  };
  private state$ = new BehaviorSubject<AudioState>(this.state);
  private lastTimeUpdate: number | null = null;
  private playPauseSubject = new Subject<'play' | 'pause'>(); // Debounce play/pause

  constructor(
    private songsService: SongsService,
    private recentlyPlayedService: RecentlyPlayedService
  ) {

    // Initialize audio element
    this.state.audio = new Audio();
    this.state.audio.volume = this.state.volume;

    // Handle audio events
    this.state.audio.addEventListener('timeupdate', () => this.updateTime());
    this.state.audio.addEventListener('ended', () => this.playNext());
    this.state.audio.addEventListener('error', (err) => this.handleAudioError(err));

    // Debounce play/pause
    this.playPauseSubject.pipe(debounceTime(300)).subscribe(action => {
      if (action === 'play' && this.state.currentSong && this.state.audio) {
        this.state.audio.play().catch(err => {
          console.error('Playback failed:', err);
          this.state.isPlaying = false;
          this.updateState();
        });
        this.state.isPlaying = true;
      } else if (action === 'pause' && this.state.audio) {
        this.state.audio.pause();
        this.state.isPlaying = false;
      }
      this.updateState();
    });
  }

  getState(): Observable<AudioState> {
    return this.state$.asObservable();
  }

  playSong(song: Song, albumId?: string, playlistId?: string): void {
    if (!song?.url) {
      console.error('Invalid song URL:', song?.name);
      this.clearQueue();
      this.updateState();
      return;
    }

    this.stopCurrentAudio();
    this.clearQueue();
    this.state.queue = [song];
    this.state.currentSong = song;
    this.state.currentSongIndex = 0;
    this.state.currentMedia = albumId
      ? { type: 'album', id: albumId }
      : playlistId
      ? { type: 'playlist', id: playlistId }
      : null;

    this.loadAndPlaySong(song);
    this.updateRecentlyPlayed();
    this.updateState();
  }

  playMedia(mediaType: 'album' | 'playlist', mediaId: string, startSongId?: string): Observable<void> {
    this.stopCurrentAudio();
    return this.songsService
      .getSongsbyAlbumIdOrPlaylistId(mediaType, mediaId)
      .pipe(
        tap(songs => {
          if (!songs || songs.length === 0) {
            console.error('No songs found for', mediaType, mediaId);
            this.clearQueue();
            this.updateState();
            return;
          }

          // Filter out songs with invalid URLs
          this.state.queue = songs.filter(song => song.url);
          if (this.state.queue.length === 0) {
            console.error('No valid songs found for', mediaType, mediaId);
            this.clearQueue();
            this.updateState();
            return;
          }

          this.state.currentMedia = { type: mediaType, id: mediaId };

          let startIndex = 0;
          if (startSongId) {
            startIndex = this.state.queue.findIndex(song => song.id === startSongId);
            if (startIndex === -1) startIndex = 0;
          }

          this.state.currentSongIndex = startIndex;
          this.state.currentSong = this.state.queue[startIndex];
          this.loadAndPlaySong(this.state.currentSong);
          this.updateRecentlyPlayed();
          this.updateState();
        }),
        catchError(err => {
          console.error('Error loading songs:', err);
          this.clearQueue();
          this.updateState();
          return of(void 0);
        }),
        switchMap(() => of(void 0))
      );
  }

  togglePlayPause(): void {
    if (!this.state.currentSong || !this.state.audio) {
      this.state.isPlaying = false;
      this.updateState();
      return;
    }
    this.playPauseSubject.next(this.state.isPlaying ? 'pause' : 'play');
  }

  playNext(): void {
    const nextIndex = this.state.currentSongIndex + 1;
    if (nextIndex < this.state.queue.length) {
      const nextSong = this.state.queue[nextIndex];
      if (!nextSong?.url) {
        console.error('Invalid next song URL:', nextSong?.name);
        this.state.queue.splice(nextIndex, 1);
        this.playNext();
        return;
      }
      this.stopCurrentAudio();
      this.state.currentSongIndex = nextIndex;
      this.state.currentSong = nextSong;
      this.loadAndPlaySong(nextSong);
      this.updateRecentlyPlayed();
      this.updateState();
    } else {
      this.stopPlayback();
    }
  }

  playPrevious(): void {
    if (this.state.currentSongIndex > 0) {
      const prevSong = this.state.queue[this.state.currentSongIndex - 1];
      if (!prevSong?.url) {
        console.error('Invalid previous song URL:', prevSong?.name);
        this.state.queue.splice(this.state.currentSongIndex - 1, 1);
        this.playPrevious();
        return;
      }
      this.stopCurrentAudio();
      this.state.currentSongIndex--;
      this.state.currentSong = prevSong;
      this.loadAndPlaySong(prevSong);
      this.updateRecentlyPlayed();
      this.updateState();
    } else if (this.state.audio && this.state.currentSong) {
      this.state.audio.currentTime = 0;
      this.playPauseSubject.next('play');
    }
  }

  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume));
    if (this.state.audio) {
      this.state.audio.volume = this.state.volume;
    }
    // localStorage.setItem('volume', this.state.volume.toString());
    // this.updateState();
  }

  seekTo(time: number): void {
    if (this.state.audio && this.state.currentSong) {
      this.state.audio.currentTime = time;
      this.updateState();
    }
  }

  private loadAndPlaySong(song: Song): void {
    if (!this.state.audio) {
      this.state.audio = new Audio();
      this.state.audio.volume = this.state.volume;
      this.state.audio.addEventListener('timeupdate', () => this.updateTime());
      this.state.audio.addEventListener('ended', () => this.playNext());
      this.state.audio.addEventListener('error', (e) => this.handleAudioError(e));
    }

    this.state.audio.src = song.url;
    this.state.audio.currentTime = 0;
    this.playPauseSubject.next('play');
  }

  private updateTime(): void {
    if (this.state.audio) {
      const now = Date.now();
      if (!this.lastTimeUpdate || now - this.lastTimeUpdate >= 1000) {
        this.lastTimeUpdate = now;
        this.updateState();
      }
    }
  }

private handleAudioError(err:ErrorEvent): void {
  console.warn('Audio error for song:', this.state.currentSong?.name || 'none', 'URL:', this.state.currentSong?.url || 'none', err);
//   if (!this.state.currentSong || this.state.queue.length === 0) {
//     this.stopPlayback();
//     return;
//   }
//   const currentIndex = this.state.currentSongIndex;
//   if (currentIndex < this.state.queue.length) {
//     this.state.queue.splice(currentIndex, 1);
//     if (currentIndex < this.state.queue.length) {
//       this.state.currentSong = this.state.queue[currentIndex];
//       this.loadAndPlaySong(this.state.currentSong);
//       this.updateRecentlyPlayed();
//       this.updateState();
//       return;
//     }
//   }
//   this.stopPlayback();
}

private stopCurrentAudio(): void {
    if (this.state.audio) {
      this.state.audio.pause();
      this.state.audio.src = '';
      this.state.audio.removeEventListener('error', (e) => this.handleAudioError(e));
      this.state.isPlaying = false;
    }
}
  private clearQueue(): void {
    this.state.queue = [];
    this.state.currentSong = null;
    this.state.currentSongIndex = -1;
    this.state.currentMedia = null;
    this.stopCurrentAudio();
  }

  private stopPlayback(): void {
    this.clearQueue();
    this.updateState();
  }

  private updateRecentlyPlayed(): void {
    // if (this.state.currentMedia) {
    //   this.recentlyPlayedService
    //     .addToRecentlyPlayed(this.state.currentMedia.type, this.state.currentMedia.id)
    //     .subscribe({
    //       error: err => console.error('Failed to update recently played:', err)
    //     });
    // }
  }

  private updateState(): void {
    this.state$.next({ ...this.state });
  }

  ngOnDestroy(): void {
    this.stopPlayback();
    if (this.state.audio) {
      this.state.audio.removeEventListener('timeupdate', () => this.updateTime());
      this.state.audio.removeEventListener('ended', () => this.playNext());
      this.state.audio.removeEventListener('error', (e) => this.handleAudioError(e));
      this.state.audio = null;
    }
    this.state$.complete();
    this.playPauseSubject.complete();
  }
}