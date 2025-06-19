import { Component, input, output, signal } from '@angular/core';


import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { PlayPauseComponent } from '../../../common/components/play-pause/play-pause.component';
import { Song } from '../../../../interfaces/song.interface';
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { SongsService } from '../../../feature/services/songs.service';
import { PlaylistsService } from '../../../feature/services/playlists.service';
import { CommonModule } from '@angular/common';
import { AddToPlaylistComponent } from "./components/add-to-playlist/add-to-playlist.component";

@Component({
  selector: 'app-songs-table',
  imports: [PlayPauseComponent, FaIconComponent, CommonModule, AddToPlaylistComponent],
  templateUrl: './songs-table.component.html',
  styleUrls: ['./songs-table.component.css']
})
export class SongsTableComponent {
  constructor(private songsService:SongsService){}
    // Inputs
    columns = input.required<{ key: string; header: string; width: string }[]>();
    songs = input.required<Song[]>();
    songsMeta = input<{ albumName: string; dateAdded: string }[]>();
    mediaType = input<'album' | 'playlist'>();
    mediaId = input<string>();
    // Outputs
    onRowClick = output<Song>();
    onPlayPause = output<{ song: Song; isPlaying: boolean }>();
    onLike = output<{ song: Song; liked: boolean }>();
    // Icons
    faHeart = faHeart;
    faPlus = faPlusCircle;
    // State
    showDropdown = signal<{ [songId: string]: boolean }>({});
  getSongProperty(song: Song, songEntry: { albumName: string; dateAdded?: string } | undefined, key: string): string {
    switch (key) {
      case 'duration':
        return song.duration;
      case 'albumName':
        return songEntry?.albumName || '';
      case 'dateAdded':
        const date = songEntry?.dateAdded;
        return date ? new Date(date).toLocaleDateString() : '';
      default:
        return ''; // Fallback for unsupported keys
    }
  }

  handlePlayPause(song: Song, isPlaying: boolean) {
    this.onPlayPause.emit({ song, isPlaying });
  }

  handleLike(song: Song) {
    if (!song.liked) {
      this.onLike.emit({ song, liked: true });
    } else {
      this.showDropdown.update(state => ({
        ...state,
        [song.id]: !state[song.id]
      }));
    }
  }

  handlePlaylistToggle(event: { song: Song; liked: boolean }) {
    this.onLike.emit(event);
    if (!event.liked) {
      this.showDropdown.update(state => ({
        ...state,
        [event.song.id]: true
      }));
    }
  }

  closeDropdown(songId: string) {
    this.showDropdown.update(state => ({
      ...state,
      [songId]: false
    }));
  }
}


// // src/app/feature/songs-table/songs-table.component.ts
// import { Component, input, output } from '@angular/core';

// import { MediaCardComponent } from '../media-card/media-card.component';

// import { FaIconComponent } from '@fortawesome/angular-fontawesome';
// import { faHeart } from '@fortawesome/free-regular-svg-icons';
// import { PlayPauseComponent } from '../../../common/components/play-pause/play-pause.component';
// import { Song } from '../../../../interfaces/song.interface';

// @Component({
//   selector: 'app-songs-table',
//   imports: [PlayPauseComponent, FaIconComponent],
//   templateUrl: './songs-table.component.html',
//   styleUrls: ['./songs-table.component.css']
// })
// export class SongsTableComponent {
//   // Inputs
//   columns = input.required<{ key: string; header: string; width: string }[]>();
//   songs = input.required<Song[]>();
//   songsMeta = input<{ albumName: string; dateAdded: string }[]>();
//   songParent = input.required<'album' | 'playlist'>(); // Add this input
//   parentId = input.required<string>(); // Add this input

//   // Outputs
//   onRowClick = output<Song>();
//   // onPlayPause = output<{ song: Song; isPlaying: boolean }>(); // Emit play/pause events
//   onLike = output<Song>(); // Emit like events

//   faHeart = faHeart;

//   getSongProperty(song: Song, songEntry: { albumName: string; dateAdded?: string } | undefined, key: string): string {
//     switch (key) {
//       case 'duration':
//         return song.duration;
//       case 'albumName':
//         return songEntry?.albumName || '';
//       case 'dateAdded':
//         const date = songEntry?.dateAdded;
//         return date ? new Date(date).toLocaleDateString() : '';
//       default:
//         return ''; // Fallback for unsupported keys
//     }
//   }

//   // handlePlayPause(song: Song, isPlaying: boolean) {
//   //   this.onPlayPause.emit({ song, isPlaying });
//   // }

//   handleLike(song: Song) {
//     this.onLike.emit(song);
//   }
// }