import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';

import {
  faShuffle,
  faBackward,
  faPlay,
  faPause,
  faForward,
  faRepeat,
  faListUl,
  faMicrophoneLines,
  faBars,
  faLaptop,
  faVolumeHigh,
  faVolumeMute,
  faCompress,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import { IconButtonComponent } from '../../../common/components/icon-button/icon-button.component';
import { Subscription } from 'rxjs';
import { AudioState } from '../../../../interfaces/audioState.interface';
import { AudioStateService } from '../../../feature/services/audioState.service';
@Component({
  selector: 'app-audio-player',
  imports: [IconButtonComponent],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  state = signal<AudioState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 0.5,
    currentMedia: null,
    currentSongIndex: -1,
    audio: null
  });
  private subscription: Subscription = new Subscription();
  currentTime = signal<number>(0); // Signal for real-time currentTime updates
  currentVolume = signal<number>(0);
  private rafId: number | null = null;

  // FontAwesome icons
  faShuffle = faShuffle;
  faBackward = faBackward;
  faPlay = faPlay;
  faPause = faPause;
  faForward = faForward;
  faRepeat = faRepeat;
  faListUl = faListUl; // Now playing view/queue
  faMicrophoneLines = faMicrophoneLines; // Lyrics
  faBars = faBars; // Queue
  faLaptop = faLaptop; // Connect to a device
  faVolumeHigh = faVolumeHigh; // Volume on
  faVolumeMute = faVolumeMute; // Volume off
  faCompress = faCompress; // Open mini player
  faExpand = faExpand; // Enter full screen

  constructor(private audioStateService: AudioStateService) {
    // Effect to update currentTime in real-time
    effect(() => {
      const audio = this.state().audio;
      if (audio && this.state().isPlaying) {
        this.startTimeUpdate();
      } else {

      }
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.audioStateService.getState().subscribe(state => {
        this.state.set(state);
        this.currentTime.set(state.audio ? state.audio.currentTime : 0);
      })
    );
  }

  togglePlayPause(): void {
    this.audioStateService.togglePlayPause();
  }

  playNext(): void {
    this.audioStateService.playNext();
  }

  playPrevious(): void {
    this.audioStateService.playPrevious();
  }

  setVolume(event: Event): void {
    const volume = (event.target as HTMLInputElement).valueAsNumber / 100;
    this.audioStateService.setVolume(volume);
  }

  toggleVolume(): void{
    if(this.state().volume>0){
      this.currentVolume.set(this.state().volume);
      this.audioStateService.setVolume(0);
    }
    else{
      this.audioStateService.setVolume(this.currentVolume());
    }
  }

  seek(event: Event): void {
    const time = (event.target as HTMLInputElement).valueAsNumber;
    this.audioStateService.seekTo(time);
    this.currentTime.set(time);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  parseDuration(duration: string): number {
    if (!duration) return 0;
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  }

  private startTimeUpdate(): void {
    const audioState = this.state().audio;
    if (audioState != null) {
      this.currentTime.set(audioState.currentTime);
    }
  }

  ngOnDestroy(): void {
   
  }
}
