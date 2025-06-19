import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { PlayPauseComponent } from '../../../../common/components/play-pause/play-pause.component';
import { Song } from '../../../../../interfaces/song.interface';
import { collection, collectionData } from '@angular/fire/firestore';
import { PlaylistsService } from '../../../services/playlists.service';
import { SongsService } from '../../../services/songs.service';

@Component({
  selector: 'app-playlist-song-adder',
  imports: [CommonModule, FormsModule, PlayPauseComponent, FaIconComponent],
  templateUrl: './playlist-song-adder.component.html',
  styleUrl: './playlist-song-adder.component.css'
})
export class PlaylistSongAdderComponent {
  playlistId = input.required<string>();
  faPlus = faPlus;
  searchQuery = signal<string>('');
  filteredSongs = signal<Song[]>([]);
  allSongs$!: Observable<Song[]>;

  constructor(
    private playlistsService: PlaylistsService,
    private songsService: SongsService
  ) {
    this.allSongs$ = this.songsService.fetchAllSongs();
    this.allSongs$.subscribe(songs => {
      this.filteredSongs.set(songs);
    });
  }

  searchSongs() {
    const query = this.searchQuery().toLowerCase();
    this.allSongs$.pipe(
      map(songs => songs.filter(song =>
        song.name.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      ))
    ).subscribe(filtered => {
      this.filteredSongs.set(filtered);
    });
  }

  addSong(songId: string) {
    this.playlistsService.addSongToPlaylist(this.playlistId(), songId).subscribe();
  }

  handlePlayPause(song: Song, isPlaying: boolean) {
    // Handle play/pause logic if needed
  }
}