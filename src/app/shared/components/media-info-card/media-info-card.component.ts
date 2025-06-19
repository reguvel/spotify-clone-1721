import { Component, input, output } from '@angular/core';
import { MediaItem } from '../../../../interfaces/mediaItem.interface';
import { CommonModule } from '@angular/common';
import { isAlbum, isPlaylist } from '../../../../interfaces/mediaItem-typeguards';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { PlaylistsService } from '../../../feature/services/playlists.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-media-info-card',
  imports: [CommonModule, FaIconComponent, FormsModule],
  templateUrl: './media-info-card.component.html',
  styleUrl: './media-info-card.component.css'
})
export class MediaInfoCardComponent {
  mediaData = input<MediaItem>();
  mediaType = input<'Album' | 'Playlist'>();
  totalDuration = input<string>();
  isAlbum = isAlbum;
  isPlaylist = isPlaylist;
  faPen = faPen;
  onEdit = output<void>();

  constructor(private playlistsService: PlaylistsService) {}

  updatePlaylistName() {
    if (this.mediaType() === 'Playlist' && this.mediaData()) {
      this.playlistsService.updatePlaylist(this.mediaData()!.id, { name: this.mediaData()!.name }).subscribe();
    }
  }
  
}