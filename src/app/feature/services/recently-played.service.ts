import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { catchError, Observable, of, switchMap, map, combineLatest, from } from 'rxjs';
import { AlbumsService } from './albums.service';
import { PlaylistsService } from './playlists.service';
import { RecentlyPlayed } from '../../../interfaces/recentlyPlayed.interface';
import { MediaItem } from '../../../interfaces/mediaItem.interface';
import { Playlist } from '../../../interfaces/playlist.interface';

@Injectable({
  providedIn: 'root'
})
export class RecentlyPlayedService {
  private readonly DOCUMENT_ID = 'user_recently_played'; // Single document for recently played

  constructor(
    private firestore: Firestore,
    private albumsService: AlbumsService,
    private playlistsService: PlaylistsService
  ) {
  }

  // Add or update a recently played album/playlist
  addToRecentlyPlayed(type: 'album' | 'playlist', mediaId: string): Observable<void> {
    const docRef = doc(this.firestore, `recentlyPlayed/${this.DOCUMENT_ID}`);
    const currentTime = new Date(); // Current date: June 02, 2025, 02:49 PM IST

    return docData(docRef).pipe(
      catchError(err => {
        console.error('Error fetching recently played document:', err);
        return of({ name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed);
      }),
      map(data => data as RecentlyPlayed || { name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed),
      switchMap((recentlyPlayed: RecentlyPlayed) => {
        const mediaList = recentlyPlayed.mediaList || [];

        // Remove existing entry with the same type and mediaId (if any)
        const updatedMediaList = mediaList.filter(
          entry => !(entry.type === type && entry.mediaId === mediaId)
        );

        // Add the new entry at the beginning (most recent)
        updatedMediaList.unshift({ type, mediaId, addedAt: currentTime });

        // Update the document in Firestore
        return from(setDoc(docRef, { name: this.DOCUMENT_ID, mediaList: updatedMediaList })).pipe(
          map(() => void 0),
          catchError(err => {
            console.error('Error updating recently played document:', err);
            return of(void 0);
          })
        );
      })
    );
  }

  // Fetch recently played items, limited by count
  getRecentlyPlayed(count: number): Observable<MediaItem[]> {
    const docRef = doc(this.firestore, `recentlyPlayed/${this.DOCUMENT_ID}`);

    return docData(docRef).pipe(
      catchError(err => {
        console.error('Error fetching recently played document:', err);
        return of({ name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed);
      }),
      map(data => data as RecentlyPlayed || { name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed),
      switchMap((recentlyPlayed: RecentlyPlayed) => {
        const mediaList = recentlyPlayed.mediaList || [];
        // Sort by addedAt (descending) and limit to count
        const sortedList = mediaList
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, count);

        // Separate album and playlist IDs
        const albumIds = sortedList
          .filter(item => item.type === 'album')
          .map(item => item.mediaId);
        const playlistIds = sortedList
          .filter(item => item.type === 'playlist')
          .map(item => item.mediaId);

        // Fetch albums and playlists in parallel
        return combineLatest([
          this.albumsService.getAlbumsByIds(albumIds),
          this.playlistsService.getPlaylistsByIds(playlistIds) // Use the new method
        ]).pipe(
          map(([albumMap, playlistMap]) => {
            // Combine albums and playlists in the original order
            const mediaItems: MediaItem[] = [];
            sortedList.forEach(item => {
              if (item.type === 'album') {
                console.log("Hi");
                const album = albumMap[item.mediaId];
                if (album) mediaItems.push(album);
              } else if (item.type === 'playlist') {
                const playlist = playlistMap[item.mediaId];
                if (playlist) mediaItems.push(playlist); 
              }
            });
            return mediaItems;
          })
        );
      })
    );
  }
}
// @Injectable({
//     providedIn: 'root'
// })
// export class RecentlyPlayedService {
//     private readonly DOCUMENT_ID = 'reguvel_recently_played'; // Single document for recently played

//     constructor(
//         private firestore: Firestore,
//         private albumsService: AlbumsService,
//         private playlistsService: PlaylistsService
//     ) { }

//     // Add or update a recently played album/playlist
//     addToRecentlyPlayed(type: 'album' | 'playlist', mediaId: string): Observable<void> {
//         const docRef = doc(this.firestore, `recentlyPlayed/${this.DOCUMENT_ID}`);
//         const currentTime = new Date(); // Use the current date and time (June 02, 2025, 02:30 PM IST)

//         return docData(docRef).pipe(
//             catchError(err => {
//                 console.error('Error fetching recently played document:', err);
//                 return of({ name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed);
//             }),
//             map(data => data as RecentlyPlayed || { name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed),
//             switchMap((recentlyPlayed: RecentlyPlayed) => {
//                 const mediaList = recentlyPlayed.mediaList || [];

//                 // Remove existing entry with the same type and mediaId (if any)
//                 const updatedMediaList = mediaList.filter(
//                     entry => !(entry.type === type && entry.mediaId === mediaId)
//                 );

//                 // Add the new entry at the beginning (most recent)
//                 updatedMediaList.unshift({ type, mediaId, addedAt: currentTime });

//                 // Update the document in Firestore
//                 // Inside addToRecentlyPlayed
//                 return from(setDoc(docRef, { name: this.DOCUMENT_ID, mediaList: updatedMediaList })).pipe(
//                     map(() => void 0),
//                     catchError(err => {
//                         console.error('Error updating recently played document:', err);
//                         return of(void 0);
//                     })
//                 );
//             })
//         );
//     }

//     // Fetch recently played items, limited by count
//     getRecentlyPlayed(count: number): Observable<MediaItem[]> {
//         const docRef = doc(this.firestore, `recentlyPlayed/${this.DOCUMENT_ID}`);

//         return docData(docRef).pipe(
//             catchError(err => {
//                 console.error('Error fetching recently played document:', err);
//                 return of({ name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed);
//             }),
//             map(data => data as RecentlyPlayed || { name: this.DOCUMENT_ID, mediaList: [] } as RecentlyPlayed),
//             switchMap((recentlyPlayed: RecentlyPlayed) => {
//                 const mediaList = recentlyPlayed.mediaList || [];
//                 // Sort by addedAt (descending) and limit to count
//                 const sortedList = mediaList
//                     .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
//                     .slice(0, count);

//                 // Separate album and playlist IDs
//                 const albumIds = sortedList
//                     .filter(item => item.type === 'album')
//                     .map(item => item.mediaId);
//                 const playlistIds = sortedList
//                     .filter(item => item.type === 'playlist')
//                     .map(item => item.mediaId);

//                 // Fetch albums and playlists in parallel
//                 return combineLatest([
//                     this.albumsService.getAlbumsByIds(albumIds),
//                     this.fetchPlaylistsByIds(playlistIds)
//                 ]).pipe(
//                     map(([albumMap, playlistMap]) => {
//                         // Combine albums and playlists in the original order
//                         const mediaItems: MediaItem[] = [];
//                         sortedList.forEach(item => {
//                             if (item.type === 'album') {
//                                 const album = albumMap[item.mediaId];
//                                 if (album) mediaItems.push(album);
//                             } else if (item.type === 'playlist') {
//                                 const playlist = playlistMap[item.mediaId];
//                                 if (playlist) mediaItems.push(playlist);
//                             }
//                         });
//                         return mediaItems;
//                     })
//                 );
//             })
//         );
//     }

//     // Helper method to fetch multiple playlists by IDs
//     private fetchPlaylistsByIds(playlistIds: string[]): Observable<{ [playlistId: string]: Playlist | null }> {
//         if (!playlistIds || playlistIds.length === 0) {
//             return of({});
//         }

//         // Remove duplicates
//         const uniquePlaylistIds = [...new Set(playlistIds)];

//         // Fetch playlists individually (PlaylistsService doesn't have a batch method)
//         const playlistObservables = uniquePlaylistIds.map(id =>
//             this.playlistsService.getPlaylistById(id).pipe(
//                 map(playlist => ({ [id]: playlist })),
//                 catchError(err => {
//                     console.error(`Error fetching playlist with ID ${id}:`, err);
//                     return of({ [id]: null });
//                 })
//             )
//         );

//         return combineLatest(playlistObservables).pipe(
//             map(results => results.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
//         );
//     }
// }