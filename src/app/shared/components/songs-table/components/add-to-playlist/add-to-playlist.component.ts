import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Song } from '../../../../../../interfaces/song.interface';
import { Subscription } from 'rxjs';
import { Playlist } from '../../../../../../interfaces/playlist.interface';
import { PlaylistsService } from '../../../../../feature/services/playlists.service';
import { SongsService } from '../../../../../feature/services/songs.service';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-to-playlist',
  imports: [FaIconComponent],
  templateUrl: './add-to-playlist.component.html',
  styleUrl: './add-to-playlist.component.css'
})
export class AddToPlaylistComponent implements OnInit, OnDestroy {
  song = input.required<Song>();
  onToggle = output<{ song: Song; liked: boolean }>();
  playlists = signal<Playlist[]>([]);
  playlistSelections = signal<Map<string, boolean>>(new Map());
  onClose = output<void>();
  private subscription = new Subscription();
  faTimes = faTimes;
  faCheck = faCheck;
  constructor(
    private playlistsService: PlaylistsService,
    private songsService: SongsService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.playlistsService.getPlaylistsInLibrary().subscribe(playlists => {
        this.playlists.set(playlists);
        const selections = new Map<string, boolean>();
        playlists.forEach(playlist => {
          const isSelected = playlist.songs.some(s => s.songId === this.song().id);
          selections.set(playlist.id, isSelected);
        });
        selections.set('lkdsngs', this.song().liked);
        this.playlistSelections.set(selections);
      })
    );
  }

  togglePlaylist(playlistId: string) {
    const isSelected = this.playlistSelections().get(playlistId);
    const songId = this.song().id;

    if (playlistId === 'lkdsngs') {
      this.songsService.toggleSongLiked(songId, !isSelected).subscribe({
        next: () => {
          this.playlistSelections.update(selections => {
            const newSelections = new Map(selections);
            newSelections.set(playlistId, !isSelected);
            return newSelections;
          });
          this.onToggle.emit({ song: this.song(), liked: !isSelected });
        },
        error: err => console.error('Error toggling liked:', err)
      });
    } else {
      const serviceCall = isSelected
        ? this.playlistsService.removeSongFromPlaylist(playlistId, songId)
        : this.playlistsService.addSongToPlaylist(playlistId, songId);
      serviceCall.subscribe({
        next: () => {
          this.playlistSelections.update(selections => {
            const newSelections = new Map(selections);
            newSelections.set(playlistId, !isSelected);
            return newSelections;
          });
        },
        error: err => console.error('Error updating playlist:', err)
      });
    }
  }
  closeDropdown() {
    this.onClose.emit();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}