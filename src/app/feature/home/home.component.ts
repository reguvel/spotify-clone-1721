import { Component, OnInit } from '@angular/core';
import { HomeMediaListComponent } from "./components/home-media-list/home-media-list.component";
import { RecentlyPlayedService } from '../services/recently-played.service';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { catchError, combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { RecentlyPlayed } from '../../../interfaces/recentlyPlayed.interface';
import { AlbumsService } from '../services/albums.service';
import { PlaylistsService } from '../services/playlists.service';
import { MediaItem } from '../../../interfaces/mediaItem.interface';
import { Playlist } from '../../../interfaces/playlist.interface';
import { Album } from '../../../interfaces/album.interface';

@Component({
  selector: 'app-home',
  imports: [HomeMediaListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent{
  private readonly DOCUMENT_ID = 'user_recently_played';
  albums$!: Observable<Album[]>;
  playlists$!: Observable<Playlist[]>;
  recentlyPlayed$!: Observable<MediaItem[]>;
  recentlyPlayedList:MediaItem[]=[];
  albumsList:MediaItem[]=[];
  playlistsList:MediaItem[]=[];

  constructor(
    private recentlyPlayedService: RecentlyPlayedService,
    private albumsService: AlbumsService,
    private playlistsService: PlaylistsService,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    // this.addTestData();
   
    // this.recentlyPlayed$ = this.recentlyPlayedService.getRecentlyPlayed(10);
    // this.recentlyPlayed$.subscribe(recentlyPlayed => {this.recentlyPlayedList = recentlyPlayed});

    this.albums$ = this.albumsService.getAlbums();
    this.albums$.subscribe(albums => {this.albumsList = albums});

    this.playlists$ = this.playlistsService.getPlaylists();
    this.playlists$.subscribe(playlists => {this.playlistsList = playlists});
  }

  // private addTestData(): void {
  //   const docRef = doc(this.firestore, `recentlyPlayed/${this.DOCUMENT_ID}`);

  //   // Check if the recentlyPlayed document already has entries
  //   docData(docRef).pipe(
  //     catchError(err => {
  //       console.error('Error checking recently played document:', err);
  //       return of({ name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed);
  //     }),
  //     map(data => data as RecentlyPlayed || { name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed),
  //     switchMap((recentlyPlayed: RecentlyPlayed) => {
  //       // if (recentlyPlayed?.mediaList?.length > 0) {
  //       //   console.log('Recently played data already exists, skipping test data addition.');
  //       //   return of(null); // Skip adding test data if entries exist
  //       // }

  //       // Add test data with staggered timestamps
  //       const testData = [
  //         { type: 'album' as const, mediaId: '1', addedAt: new Date('2025-06-02T15:07:00+05:30') }, // Most recent: 03:07 PM IST
  //         { type: 'album' as const, mediaId: '2', addedAt: new Date('2025-06-02T14:30:00+05:30') }, // 02:30 PM IST
  //         { type: 'album' as const, mediaId: '3', addedAt: new Date('2025-06-02T13:00:00+05:30') }, // 01:00 PM IST
  //         { type: 'album' as const, mediaId: '4', addedAt: new Date('2025-06-02T12:00:00+05:30') }, // 12:00 PM IST
  //         { type: 'playlist' as const, mediaId: 'p1', addedAt: new Date('2025-06-02T11:00:00+05:30') } // 11:00 AM IST
  //       ];

  //       // Add each item sequentially
  //       return combineLatest(
  //         testData.map(data =>
  //           this.recentlyPlayedService.addToRecentlyPlayed(data.type, data.mediaId).pipe(
  //             tap(() => console.log(`Added ${data.type} with ID ${data.mediaId} at ${data.addedAt.toISOString()}`))
  //           )
  //         )
  //       );
  //     })
  //   ).subscribe({
  //     next: () => console.log('Test data addition completed.'),
  //     error: err => console.error('Error adding test data:', err)
  //   });
  // }
}