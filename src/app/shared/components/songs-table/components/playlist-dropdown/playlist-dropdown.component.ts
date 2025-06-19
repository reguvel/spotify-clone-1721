import { Component, ElementRef, input, OnDestroy, OnInit, output } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaylistsService } from '../../../../../feature/services/playlists.service';
import { SongsService } from '../../../../../feature/services/songs.service';

@Component({
  selector: 'app-playlist-dropdown',
  imports: [],
  templateUrl: './playlist-dropdown.component.html',
  styleUrl: './playlist-dropdown.component.css'
})
export class PlaylistDropdownComponent implements OnInit, OnDestroy {
  songId = input.required<string>();
  onTogglePlaylist = output<{ playlistId: string; add: boolean }>();
  onToggleLiked = output<boolean>();
  playlists: { playlistId: string; name: string; inPlaylist: boolean }[] = [];
  private subscription = new Subscription();

  constructor(
    private playlistsService: PlaylistsService,
    private songsService: SongsService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.playlistsService.getPlaylistsForSong(this.songId()).subscribe(playlists => {
        this.playlists = playlists;
      })
    );
  }

  togglePlaylist(playlistId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.onTogglePlaylist.emit({ playlistId, add: checked });
  }

  toggleLiked(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.onToggleLiked.emit(checked);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}