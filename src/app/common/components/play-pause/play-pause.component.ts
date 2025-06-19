// src/app/common/components/play-pause/play-pause.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, input, output, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

import { Subscription } from 'rxjs';
import { Song } from '../../../../interfaces/song.interface';
import { AudioState } from '../../../../interfaces/audioState.interface';
import { AudioStateService } from '../../../feature/services/audioState.service';

@Component({
  selector: 'app-play-pause',
  imports: [FaIconComponent],
  templateUrl: './play-pause.component.html',
  styleUrls: ['./play-pause.component.css']
})
export class PlayPauseComponent implements OnInit, OnDestroy {

  //  Inputs with defaults
  buttonSize = input<number>(56); // Default size: 56px
  backgroundColor = input<string>('var(--spotify-green)'); // Default: Spotify green
  borderRadius = input<string>('50%'); // Default: Circular
  iconColor = input<string>('var(--spotify-dark)'); // Default: Spotify dark (black)
  mediaType = input<'album' | 'playlist'| undefined>(undefined);
  mediaId = input<string |undefined>(undefined);
  song=input<Song | null>(null);
  onToggle = output<boolean>();

  isPlaying = signal(false);
  faPlay = faPlay;
  faPause = faPause;
  private subscription: Subscription = new Subscription();
  private state = signal<AudioState | undefined>(undefined);

  constructor(private audioStateService: AudioStateService) {}

  ngOnInit(): void {
    // Convert AudioStateService observable to signal
    this.subscription.add(
      this.audioStateService.getState().subscribe(state => {
        this.state.set(state);
        // Update isPlaying based on context
        if (this.song()) {
          this.isPlaying.set(
            state.isPlaying &&
            state.currentSong?.id === this.song()?.id
          );
        } else if (this.mediaType() && this.mediaId()) {
          this.isPlaying.set(
            state.isPlaying &&
            state.currentMedia?.type === this.mediaType() &&
            state.currentMedia?.id === this.mediaId()
          );
        } else if (this.song()) {
          this.isPlaying.set(state.isPlaying && state.currentSong?.id === this.song()!.id);
        } else {
          this.isPlaying.set(state.isPlaying);
        }
      })
    );
  }

  // togglePlayPause(): void {
  //   if (this.isPlaying()) {
  //     this.audioStateService.togglePlayPause();
  //   } else {
  //    if ((this.mediaType()=='album' || this.mediaType() == 'playlist') && this.mediaId()) {
  //       this.audioStateService.playMedia(this.mediaType()!, this.mediaId()!, this.song()?.id).subscribe();
  //     } else {
  //       this.audioStateService.togglePlayPause();
  //     }
  //   }
  //   this.onToggle.emit(this.isPlaying());
  //  }
  togglePlayPause(): void {
    const state = this.state();
    const currentSongId = state?.currentSong?.id;
    const inputSongId = this.song()?.id;
    const currentMedia = state?.currentMedia;
    const inputMediaType = this.mediaType();
    const inputMediaId = this.mediaId();
  
    if (this.isPlaying()) {
      this.audioStateService.togglePlayPause();
    } else {
      // Resume current song if it matches
      if (currentSongId && inputSongId && currentSongId === inputSongId && state?.audio) {
        this.audioStateService.togglePlayPause();
      }
      // Resume current album/playlist if it matches
      else if (
        currentMedia &&
        !inputSongId &&
        inputMediaType &&
        inputMediaId &&
        currentMedia.type === inputMediaType &&
        currentMedia.id === inputMediaId &&
        state?.audio 
      ) {
        this.audioStateService.togglePlayPause();
      }
      // Start new playback
      else {
        if (inputMediaType && inputMediaId) {
          this.audioStateService.playMedia(inputMediaType, inputMediaId, this.song()?.id).subscribe();
        } else if (this.song()) {
          this.audioStateService.playSong(this.song()!);
        } else {
          this.audioStateService.togglePlayPause();
        }
      }
    }
    this.onToggle.emit(this.isPlaying());
  }
  ngOnDestroy(): void {
  }
}
