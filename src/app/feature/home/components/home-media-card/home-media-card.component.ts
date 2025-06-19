import { Component, computed, Input, input } from '@angular/core';
import { MediaItem } from '../../../../../interfaces/mediaItem.interface';
import { PlayPauseComponent } from "../../../../common/components/play-pause/play-pause.component";
import { isAlbum, isPlaylist } from '../../../../../interfaces/mediaItem-typeguards';

@Component({
  selector: 'app-home-media-card',
  imports: [PlayPauseComponent],
  templateUrl: './home-media-card.component.html',
  styleUrl: './home-media-card.component.css'
})
export class HomeMediaCardComponent {
  mediaData = input<MediaItem | undefined>();
  isAlbum = isAlbum;
  isPlaylist = isPlaylist;

  getMediaType = computed(() => {
    const media = this.mediaData();
    if (!media) return null;
    return this.isAlbum(media) ? 'album' : this.isPlaylist(media) ? 'playlist' : null;
  });
}