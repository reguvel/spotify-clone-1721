import { Component, input, OnDestroy, OnInit, signal } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { MediaCardComponent } from '../../../../../shared/components/media-card/media-card.component';
import { AlbumsService } from '../../../../../feature/services/albums.service';
import { Router } from '@angular/router';
import { Album } from '../../../../../../interfaces/album.interface';
import { Playlist } from '../../../../../../interfaces/playlist.interface';
import { PlaylistsService } from '../../../../../feature/services/playlists.service';
import { Song } from '../../../../../../interfaces/song.interface';
import { SongsService } from '../../../../../feature/services/songs.service';

@Component({
  selector: 'app-media-card-list',
  imports: [MediaCardComponent],
  templateUrl: './media-card-list.component.html',
  styleUrl: './media-card-list.component.css',
  standalone:true,
})
export class MediaCardListComponent implements OnInit, OnDestroy {
  albums$!: Observable<Album[]>;
  playlists$!: Observable<Playlist[]>;
  constructor(private albumsService: AlbumsService,private playlistsService: PlaylistsService, private songsService: SongsService,private router: Router) { }
  albumsList = signal<Album[]>([]);
  playlistsList = signal<Playlist[]>([]);
  private subscription: Subscription = new Subscription();
  ngOnInit(): void {
    this.albums$ = this.albumsService.getAlbumsInLibrary();
    this.subscription.add(
      this.albums$.subscribe(albums => this.albumsList.set(albums))
    );

    this.playlists$ = this.playlistsService.getPlaylistsInLibrary();
    this.subscription.add(
      this.playlists$.subscribe(playlists => this.playlistsList.set(playlists))
    );

  }
  navigateToAlbum(albumId:string){
    this.router.navigate(['album', albumId]); 
  }
  navigateToPlaylist(playlistId:string){
    this.router.navigate(['playlist', playlistId]); 
  }

  getSongsbyAlbumIdOrPlaylistId(mediaType: 'album' |'playlist', mediaId:string): Observable<Song[]>{
    // return this.getSongsbyAlbumId(albumId);
    if(mediaType == 'album'){
      return this.songsService.getSongsByAlbumId(mediaId);
    }
    else{
      return this.songsService.getSongsByPlaylistId(mediaId).pipe(
        map(playlistSongs => playlistSongs.map(item => item.song))
      );
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
