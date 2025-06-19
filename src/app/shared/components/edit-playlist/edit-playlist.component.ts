import { Component, input, output } from '@angular/core';
import { Playlist } from '../../../../interfaces/playlist.interface';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-playlist',
  imports: [CommonModule, FaIconComponent, FormsModule],
  templateUrl: './edit-playlist.component.html',
  styleUrl: './edit-playlist.component.css'
})
export class EditPlaylistComponent {
  isOpen = input<boolean>(false);
  playlist = input<Playlist | undefined>();
  onSave = output<Partial<Playlist>>();
  onClose = output<void>();
  faTimes = faTimes;

  updatedPlaylist: Partial<Playlist> = {};

  ngOnChanges() {
    if (this.playlist()) {
      this.updatedPlaylist = {
        img: this.playlist()!.img,
        name: this.playlist()!.name,
        description: this.playlist()!.description || ''
      };
    }
  }
}
