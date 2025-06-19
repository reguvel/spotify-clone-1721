// import { Component } from '@angular/core';
// import { MediaInfoCardComponent } from "../../shared/components/media-info-card/media-info-card.component";
// import { MediaControlsComponent } from "../../shared/components/media-controls/media-controls.component";
// import { SongsTableComponent } from "../../shared/components/songs-table/songs-table.component";
// import { combineLatest, map, Observable } from 'rxjs';
// import { Playlist } from '../../../interfaces/playlist.interface';
// import { Song } from '../../../interfaces/song.interface';
// import { PlaylistsService } from '../services/playlists.service';
// import { SongsService } from '../services/songs.service';
// import { ActivatedRoute } from '@angular/router';
// import { AsyncPipe } from '@angular/common';

// @Component({
//   selector: 'app-playlist',
//   imports: [MediaInfoCardComponent, MediaControlsComponent, SongsTableComponent, AsyncPipe],
//   templateUrl: './playlist.component.html',
//   styleUrl: './playlist.component.css'
// })
// export class PlaylistComponent {
//   playlist$!: Observable<Playlist | null>;
//   songs$!: Observable<Song[]>;
//   songDates$!: Observable<{ [songId: string]: string }>;
//   playlistData: Playlist | undefined = undefined;
 
//    constructor(
//      private playlistsService: PlaylistsService,
//      private songsService: SongsService,
//      private route: ActivatedRoute
//    ) {}
 
//    ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       const playlistId = params.get('id') || '';
//       this.playlist$ = this.playlistsService.getPlaylistById(playlistId);
//       const rawSongs$ = this.songsService.getSongsByPlaylistId(playlistId);

//       // Extract just the songs for the table
//       this.songs$ = rawSongs$.pipe(
//         map(songEntries => songEntries.map(entry => entry.song))
//       );

//       // Extract song IDs and their dateAdded values
//       this.songDates$ = rawSongs$.pipe(
//         map(songEntries => 
//           songEntries.reduce((acc, entry) => {
//             acc[entry.song.id] = entry.dateAdded;
//             return acc;
//           }, {} as { [songId: string]: string })
//         )
//       );

//       combineLatest([this.playlist$, this.songs$]).subscribe(([playlist, songs]) => {
//         if(!playlist){
//           this.playlistData = undefined;
//         }
//         else{
//           this.playlistData = playlist;
//         }
//       });
//     });
//   }

//   handleRowClick(song: Song) {
//     console.log('Song clicked:', song);
//     // Add logic to play the song
//   }
// }
import { Component, output, signal } from '@angular/core';
import { MediaInfoCardComponent } from "../../shared/components/media-info-card/media-info-card.component";
import { MediaControlsComponent } from "../../shared/components/media-controls/media-controls.component";
import { SongsTableComponent } from "../../shared/components/songs-table/songs-table.component";
import { combineLatest, Observable } from 'rxjs';
import { Playlist } from '../../../interfaces/playlist.interface';
import { Song } from '../../../interfaces/song.interface';
import { PlaylistsService } from '../services/playlists.service';
import { SongsService } from '../services/songs.service';
import { ActivatedRoute } from '@angular/router';
import { PlaylistSongAdderComponent } from './components/playlist-song-adder/playlist-song-adder.component';
import { EditPlaylistComponent } from '../../shared/components/edit-playlist/edit-playlist.component';

@Component({
  selector: 'app-playlist',
  imports: [MediaInfoCardComponent, MediaControlsComponent, SongsTableComponent, PlaylistSongAdderComponent, EditPlaylistComponent],
  templateUrl: './playlist.component.html',
    styleUrl: './playlist.component.css'
})
export class PlaylistComponent {
  playlist$!: Observable<Playlist | null>;
  songs$!: Observable<{ song: Song; albumName: string; dateAdded: string }[]>;
  // dateAdded: string }[]>;
  playlistData = signal<Playlist | undefined>(undefined);
  totalDuration = signal<string>('');
  songsList = signal<Song[]>([]);
  songsMeta = signal<{ albumName: string; dateAdded: string }[]>([]);
  playlistId = signal<string>('');
  showFallback = signal(false);
  showEditModal = signal(false);

  handleRowClick = output<Song>();
  constructor(
    private playlistsService: PlaylistsService,
    private songsService: SongsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.playlistId.set(id);
      this.playlist$ = this.playlistsService.getPlaylistById(id);
      this.songs$ = this.songsService.getSongsByPlaylistId(id);

      combineLatest([this.playlist$, this.songs$]).subscribe(([playlist, songs]) => {
        this.playlistData.set(playlist || undefined);
        this.songsList.set(songs.map(item => item.song));
        this.totalDuration.set(this.songsService.calculateTotalDuration(this.songsList()));
        this.songsMeta.set(songs.map(item => ({ albumName: item.albumName, dateAdded: item.dateAdded })));
        if (this.songsList().length === 0) {
          this.showFallback.set(true);
        }
      });
    });
  }


  onRowClick(song: Song): void {
    this.handleRowClick.emit(song);
  }

  updatePlaylist(updates: Partial<Playlist>) {
    if (this.playlistId()) {
      this.playlistsService.updatePlaylist(this.playlistId(), updates).subscribe(() => {
        this.showEditModal.set(false);
      });
    }
  }
}