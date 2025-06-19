import { Component, output, signal } from '@angular/core';

import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { AlbumsService } from '../services/albums.service';
import { SongsService } from '../services/songs.service';
import { ActivatedRoute } from '@angular/router';
import { MediaInfoCardComponent } from '../../shared/components/media-info-card/media-info-card.component';

import { Song } from '../../../interfaces/song.interface';
import { MediaControlsComponent } from "../../shared/components/media-controls/media-controls.component";
import { SongsTableComponent } from "../../shared/components/songs-table/songs-table.component";
import { Album } from '../../../interfaces/album.interface';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-album',
  imports: [MediaInfoCardComponent, MediaControlsComponent, SongsTableComponent, AsyncPipe],
  templateUrl: './album.component.html',
  styleUrl: './album.component.css'
})
export class AlbumComponent {
  album$!: Observable<Album | null>;
  songs$!: Observable<Song[]>;
  albumData = signal<Album | undefined>(undefined);
  totalDuration = signal<string>('');
  albumId = signal<string>('');

  constructor(
    private albumsService: AlbumsService,
    private songsService: SongsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.albumId.set(id);
      this.album$ = this.albumsService.getAlbumById(id);
      this.songs$ = this.songsService.getSongsByAlbumId(id);

      combineLatest([this.album$, this.songs$]).subscribe(([album, songs]) => {
        this.albumData.set(album || undefined);
        this.totalDuration.set(this.songsService.calculateTotalDuration(songs));
      });
    });
  }

  handleRowClick = output<Song>();

  onRowClick(song: Song): void {
    this.handleRowClick.emit(song);
  }

  handleLike(event: { song: Song; liked: boolean }): void {
    this.songsService.toggleSongLiked(event.song.id, event.liked).subscribe({
      error: err => console.error('Error toggling liked:', err)
    });
  }
}
