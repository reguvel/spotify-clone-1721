import { Component, Input, input } from '@angular/core';
import { PlayPauseComponent } from '../../../common/components/play-pause/play-pause.component';
import { MediaItem } from '../../../../interfaces/mediaItem.interface';


@Component({
  selector: 'app-media-card',
  imports: [PlayPauseComponent],
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.css']
})
export class MediaCardComponent {
  // mediaData = input<MediaItem>();
  @Input() mediaData: MediaItem | undefined;
  // Handle play/pause toggle (for now, just log the state)
  onPlayPauseToggle(isPlaying: boolean) {
    console.log(`Play/Pause toggled for ${this.mediaData?.name}: ${isPlaying ? 'Playing' : 'Paused'}`);
  }
}