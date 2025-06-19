
// import { Injectable } from '@angular/core';
// import { collection, collectionData, doc, docData, Firestore, query, where } from '@angular/fire/firestore';
// import { catchError, Observable, of, switchMap } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { Song } from '../../../interfaces/song.interface';
// import { AlbumsService } from './albums.service';
// import { PlaylistsService } from './playlists.service';
// import { Album } from '../../../interfaces/album.interface';

// @Injectable({
//   providedIn: 'root'
// })
// export class SongsService {

//   constructor(
//     private firestore: Firestore,
//     private albumsService: AlbumsService,
//     private playlistsService: PlaylistsService
//   ) { }

//   // Helper function to batch-fetch album names using AlbumsService
//   private fetchAlbumNames(albumIds: string[]): Observable<{ [albumId: string]: string }> {
//     if (!albumIds || albumIds.length === 0) {
//       return of({});
//     }

//     // Remove duplicates to minimize Firestore reads
//     const uniqueAlbumIds = [...new Set(albumIds)];

//     // Fetch albums using AlbumsService's batch method
//     return this.albumsService.getAlbumsByIds(uniqueAlbumIds).pipe(
//       map(albumMap => {
//         const nameMap: { [albumId: string]: string } = {};
//         Object.entries(albumMap).forEach(([albumId, album]) => {
//           nameMap[albumId] = album ? album.name : 'Unknown Album';
//         });
//         return nameMap;
//       })
//     );
//   }
//   getSongsByAlbumId(albumId: string): Observable<Song[]> {
//     const albumRef = doc(this.firestore, `albums/${albumId}`);
//     return docData(albumRef, { idField: 'id' }).pipe(
//       catchError(err => {
//         console.error(`Error fetching album with ID ${albumId}:`, err);
//         return of(null);
//       }),
//       switchMap(album => {
//         if (!album || !(album as Album).songs || (album as Album).songs.length === 0) {
//           return of([]);
//         }

//         const songIds = (album as Album).songs;

//         const songsRef = collection(this.firestore, 'songs');
//         const q = query(songsRef, where('id', 'in', songIds));
//         return collectionData(q, { idField: 'id' }).pipe(
//           catchError(err => {
//             console.error('Error fetching songs:', err);
//             return of([]);
//           }),
//           map(songs => songs.map(song => ({ ...song, type: 'song' } as Song))),
//           switchMap(songs => {
//             // Sort songs to match the order of songIds
//             const orderedSongs = songIds
//               .map(id => songs.find(song => song.id === id))
//               .filter((song): song is Song => !!song);
//             return of(orderedSongs);
//           })
//         );
//       })
//     ) as Observable<Song[]>;
//   }
//   getSongsByAlbumIdWithAlbumName(albumId: string): Observable<{ song: Song; albumName: string }[]> {
//     return this.albumsService.getAlbumById(albumId).pipe(
//       switchMap(album => {
//         if (!album || !album.songs || album.songs.length === 0) {
//           return of([]);
//         }

//         const songIds = album.songs;
//         const albumName = album.name;

//         const songsRef = collection(this.firestore, 'songs');
//         const q = query(songsRef, where('id', 'in', songIds));
//         return collectionData(q, { idField: 'id' }).pipe(
//           catchError(err => {
//             console.error('Error fetching songs:', err);
//             return of([]);
//           }),
//           // map(songs => {
//           //   // Sort songs to match the order of songIds
//           //   const orderedSongs = songIds
//           //     .map(id => songs.find(song => song.id === id))
//           //     .filter((song): song is Song => !!song)
//           //     .map(song => ({ song, albumName })); // Attach albumName to each song
//           //   return orderedSongs;
//           // })
//           map(songs =>
//             songs.map(song => ({ ...song, type: 'song' } as Song)).map(song => ({ song, albumName }))
//           )
//         );
//       })
//     ) as Observable<{ song: Song; albumName: string }[]>;
//   }

//   getSongsByPlaylistId(playlistId: string): Observable<{ song: Song; albumName: string; dateAdded: string }[]> {
//     return this.playlistsService.getPlaylistById(playlistId).pipe(
//       switchMap(playlist => {
//         if (!playlist || !playlist.songs || playlist.songs.length === 0) {
//           return of([]);
//         }

//         const songEntries = playlist.songs;
//         const songIds = songEntries.map(entry => entry.songId);

//         const songsRef = collection(this.firestore, 'songs');
//         const q = query(songsRef, where('id', 'in', songIds));
//         return collectionData(q, { idField: 'id' }).pipe(
//           catchError(err => {
//             console.error('Error fetching songs:', err);
//             return of([]);
//           }),
//           map(songs => songs.map(song => ({ ...song, type: 'song' } as Song))),
//           switchMap(songs => {
//             // Sort songs to match the order of songEntries
//             const orderedSongs = songEntries
//               .map(entry => {
//                 const song = songs.find(s => s.id === entry.songId);
//                 return song ? { song, dateAdded: entry.dateAdded } : null;
//               })
//               .filter((item): item is { song: Song; dateAdded: string } => !!item);

//             // Collect unique album IDs
//             const albumIds = orderedSongs.map(item => item.song.albumId);

//             // Fetch album names
//             return this.fetchAlbumNames(albumIds).pipe(
//               map(albumMap => {
//                 // Attach albumName to each song
//                 return orderedSongs.map(item => ({
//                   song: item.song,
//                   albumName: albumMap[item.song.albumId] || 'Unknown Album',
//                   dateAdded: item.dateAdded
//                 }));
//               })
//             );
//           })
//         );
//       })
//     ) as Observable<{ song: Song; albumName: string; dateAdded: string }[]>;
//   }

//   calculateTotalDuration(songs: Song[]): string {
//     if (!songs || songs.length === 0) return '0 min 0 sec';
  
//     const totalSeconds = songs.reduce((sum, song) => {
//       if (!song.duration) return sum; // Handle missing duration
//       const [minutes, seconds] = song.duration.split(':').map(Number);
//       return sum + (minutes * 60 + seconds);
//     }, 0);
  
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes} min ${seconds} sec`;
//   }

//   getSongsbyAlbumIdOrPlaylistId(mediaType: 'album' | 'playlist', mediaId: string): Observable<Song[]> {
//     if (mediaType === 'album') {
//       return this.getSongsByAlbumId(mediaId);
//     } else {
//       return this.getSongsByPlaylistId(mediaId).pipe(
//         map(playlistSongs => playlistSongs.map(item => item.song))
//       );
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, query, where, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, docData, collectionData, onSnapshot } from '@angular/fire/firestore';
import { catchError, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { Song } from '../../../interfaces/song.interface';
import { AlbumsService } from './albums.service';
import { PlaylistsService } from './playlists.service';
import { Album } from '../../../interfaces/album.interface';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  constructor(
    private firestore: Firestore,
    private albumsService: AlbumsService,
    private playlistsService: PlaylistsService
  ) {}

  // Helper function to batch-fetch album names (unchanged)
  private fetchAlbumNames(albumIds: string[]): Observable<{ [albumId: string]: string }> {
    if (!albumIds || albumIds.length === 0) {
      return of({});
    }
    const uniqueAlbumIds = [...new Set(albumIds)];
    return this.albumsService.getAlbumsByIds(uniqueAlbumIds).pipe(
      map(albumMap => {
        const nameMap: { [albumId: string]: string } = {};
        Object.entries(albumMap).forEach(([albumId, album]) => {
          nameMap[albumId] = album ? album.name : 'Unknown Album';
        });
        return nameMap;
      })
    );
  }

  fetchAllSongs(): Observable<Song[]> {
    const songsRef = collection(this.firestore, 'songs');
    return collectionData(songsRef, { idField: 'id' }).pipe(
      map(songs => songs.map(song => ({ ...song, type: 'song' } as Song))),
      catchError(err => {
        console.error('Error fetching songs:', err);
        return of([]);
      })
    );
  }

  // Fetch songs by album ID with real-time updates
  getSongsByAlbumId(albumId: string): Observable<Song[]> {
    return this.albumsService.getAlbumById(albumId).pipe(
      switchMap(album => {
        if (!album || !album.songs || album.songs.length === 0) {
          return of([]);
        }
        const songIds = album.songs;
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds.slice(0, 30)));
        return new Observable<Song[]>(observer => {
          const unsubscribe = onSnapshot(
            q,
            snapshot => {
              const songs = songIds
                .map(id => snapshot.docs.find(doc => doc.id === id))
                .filter((doc): doc is NonNullable<typeof doc> => !!doc)
                .map(doc => ({ ...doc.data(), id: doc.id, type: 'song' } as Song));
              observer.next(songs);
            },
            err => {
              console.error('Error fetching songs:', err);
              observer.next([]);
            }
          );
          return () => unsubscribe();
        });
      })
    );
  }
  // // Fetch songs by album ID (optimized with getDocs)
  // getSongsByAlbumId(albumId: string): Observable<Song[]> {
  //   return this.albumsService.getAlbumById(albumId).pipe(
  //     switchMap(album => {
  //       if (!album || !album.songs || album.songs.length === 0) {
  //         return of([]);
  //       }

  //       const songIds = album.songs;
  //       const songsRef = collection(this.firestore, 'songs');
  //       const q = query(songsRef, where('__name__', 'in', songIds.slice(0, 30))); // Limit to 30 IDs
  //       return new Observable<Song[]>(observer => {
  //         getDocs(q)
  //           .then(snapshot => {
  //             const songs = songIds
  //               .map(id => snapshot.docs.find(doc => doc.id === id))
  //               .filter((doc): doc is NonNullable<typeof doc> => !!doc)
  //               .map(doc => ({ ...doc.data(), id: doc.id, type: 'song' } as Song));
  //             observer.next(songs);
  //             observer.complete();
  //           })
  //           .catch(err => {
  //             console.error('Error fetching songs:', err);
  //             observer.next([]);
  //             observer.complete();
  //           });
  //       });
  //     })
  //   );
  // }
  //   getSongsByAlbumId(albumId: string): Observable<Song[]> {
  //   const albumRef = doc(this.firestore, `albums/${albumId}`);
  //   return docData(albumRef, { idField: 'id' }).pipe(
  //     catchError(err => {
  //       console.error(`Error fetching album with ID ${albumId}:`, err);
  //       return of(null);
  //     }),
  //     switchMap(album => {
  //       if (!album || !(album as Album).songs || (album as Album).songs.length === 0) {
  //         return of([]);
  //       }

  //       const songIds = (album as Album).songs;

  //       const songsRef = collection(this.firestore, 'songs');
  //       const q = query(songsRef, where('id', 'in', songIds));
  //       return collectionData(q, { idField: 'id' }).pipe(
  //         catchError(err => {
  //           console.error('Error fetching songs:', err);
  //           return of([]);
  //         }),
  //         map(songs => songs.map(song => ({ ...song, type: 'song' } as Song))),
  //         switchMap(songs => {
  //           // Sort songs to match the order of songIds
  //           const orderedSongs = songIds
  //             .map(id => songs.find(song => song.id === id))
  //             .filter((song): song is Song => !!song);
  //           return of(orderedSongs);
  //         })
  //       );
  //     })
  //   ) as Observable<Song[]>;
  // }

   
  // Fetch songs by album ID with album name (optimized with getDocs)
  getSongsByAlbumIdWithAlbumName(albumId: string): Observable<{ song: Song; albumName: string }[]> {
    return this.albumsService.getAlbumById(albumId).pipe(
      switchMap(album => {
        if (!album || !album.songs || album.songs.length === 0) {
          return of([]);
        }

        const songIds = album.songs;
        const albumName = album.name;
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds.slice(0, 30)));
        return new Observable<{ song: Song; albumName: string }[]>(observer => {
          getDocs(q)
            .then(snapshot => {
              const songs = songIds
                .map(id => snapshot.docs.find(doc => doc.id === id))
                .filter((doc): doc is NonNullable<typeof doc> => !!doc)
                .map(doc => ({
                  song: { ...doc.data(), id: doc.id, type: 'song' } as Song,
                  albumName
                }));
              observer.next(songs);
              observer.complete();
            })
            .catch(err => {
              console.error('Error fetching songs:', err);
              observer.next([]);
              observer.complete();
            });
        });
      })
    );
  }

  // Fetch songs by playlist ID with album names (optimized with getDocs)
  // getSongsByPlaylistId(playlistId: string): Observable<{ song: Song; albumName: string; dateAdded: string }[]> {
  //   return this.playlistsService.getPlaylistById(playlistId).pipe(
  //     switchMap(playlist => {
  //       if (!playlist || !playlist.songs || playlist.songs.length === 0) {
  //         return of([]);
  //       }

  //       const songEntries = playlist.songs;
  //       const songIds = songEntries.map(entry => entry.songId);
  //       const songsRef = collection(this.firestore, 'songs');
  //       const q = query(songsRef, where('__name__', 'in', songIds.slice(0, 30)));
  //       return new Observable<Song[]>(observer => {
  //         getDocs(q)
  //           .then(snapshot => {
  //             const songs = songIds
  //               .map(id => snapshot.docs.find(doc => doc.id === id))
  //               .filter((doc): doc is NonNullable<typeof doc> => !!doc)
  //               .map(doc => ({ ...doc.data(), id: doc.id, type: 'song' } as Song));
  //             observer.next(songs);
  //             observer.complete();
  //           })
  //           .catch(err => {
  //             console.error('Error fetching songs:', err);
  //             observer.next([]);
  //             observer.complete();
  //           });
  //       }).pipe(
  //         switchMap(songs => {
  //           const orderedSongs = songEntries
  //             .map(entry => {
  //               const song = songs.find(s => s.id === entry.songId);
  //               return song ? { song, dateAdded: entry.dateAdded } : null;
  //             })
  //             .filter((item): item is { song: Song; dateAdded: string } => !!item);

  //           const albumIds = orderedSongs.map(item => item.song.albumId);
  //           return this.fetchAlbumNames(albumIds).pipe(
  //             map(albumMap => {
  //               return orderedSongs.map(item => ({
  //                 song: item.song,
  //                 albumName: albumMap[item.song.albumId] || 'Unknown Album',
  //                 dateAdded: item.dateAdded
  //               }));
  //             })
  //           );
  //         })
  //       );
  //     })
  //   );
  // }
  // Fetch songs by playlist ID with real-time updates
  getSongsByPlaylistId(playlistId: string): Observable<{ song: Song; albumName: string; dateAdded: string }[]> {
    return this.playlistsService.getPlaylistById(playlistId).pipe(
      switchMap(playlist => {
        if (!playlist || !playlist.songs || playlist.songs.length === 0) {
          return of([]);
        }
        const songEntries = playlist.songs;
        const songIds = songEntries.map(entry => entry.songId);
        const songsRef = collection(this.firestore, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds.slice(0, 30)));
        return new Observable<Song[]>(observer => {
          const unsubscribe = onSnapshot(
            q,
            snapshot => {
              const songs = songIds
                .map(id => snapshot.docs.find(doc => doc.id === id))
                .filter((doc): doc is NonNullable<typeof doc> => !!doc)
                .map(doc => ({ ...doc.data(), id: doc.id, type: 'song' } as Song));
              observer.next(songs);
            },
            err => {
              console.error('Error fetching songs:', err);
              observer.next([]);
            }
          );
          return () => unsubscribe();
        }).pipe(
          switchMap(songs => {
            const orderedSongs = songEntries
              .map(entry => {
                const song = songs.find(s => s.id === entry.songId);
                return song ? { song, dateAdded: entry.dateAdded } : null;
              })
              .filter((item): item is { song: Song; dateAdded: string } => !!item);
            const albumIds = orderedSongs.map(item => item.song.albumId);
            return this.fetchAlbumNames(albumIds).pipe(
              map(albumMap => {
                return orderedSongs.map(item => ({
                  song: item.song,
                  albumName: albumMap[item.song.albumId] || 'Unknown Album',
                  dateAdded: item.dateAdded
                }));
              })
            );
          })
        );
      })
    );
  }

  // Calculate total duration (unchanged)
  calculateTotalDuration(songs: Song[]): string {
    if (!songs || songs.length === 0) return '0 min 0 sec';
    const totalSeconds = songs.reduce((sum, song) => {
      if (!song.duration) return sum;
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return sum + (minutes * 60 + seconds);
    }, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  }

  // Fetch songs by album or playlist ID (updated to use optimized methods)
  getSongsbyAlbumIdOrPlaylistId(mediaType: 'album' | 'playlist', mediaId: string): Observable<Song[]> {
    if (mediaType === 'album') {
      return this.getSongsByAlbumId(mediaId);
    } else {
      return this.getSongsByPlaylistId(mediaId).pipe(
        map(playlistSongs => playlistSongs.map(item => item.song))
      );
    }
  }
   // Toggle liked state and update Liked Songs playlist
   toggleSongLiked(songId: string, liked: boolean): Observable<void> {
    const songRef = doc(this.firestore, `songs/${songId}`);
    const likedSongsPlaylistId = 'lkdsngs';
    const playlistRef = doc(this.firestore, `playlists/${likedSongsPlaylistId}`);
    const dateAdded = new Date().toISOString();

    const songUpdate = from(setDoc(songRef, { liked }, { merge: true }));

    const playlistUpdate = liked
      ? from(updateDoc(playlistRef, { songs: arrayUnion({ songId, dateAdded }) }))
      : this.playlistsService.getPlaylistById(likedSongsPlaylistId).pipe(
          switchMap(playlist => {
            if (!playlist || !playlist.songs) return of(undefined);
            const songEntry = playlist.songs.find(s => s.songId === songId);
            if (!songEntry) return of(undefined);
            return from(updateDoc(playlistRef, { songs: arrayRemove(songEntry) }));
          })
        );

    return forkJoin([songUpdate, playlistUpdate]).pipe(
      map(() => undefined)
    );
  }

    // Toggle liked state and add/remove from Liked Songs playlist
    // toggleSongLiked(songId: string, liked: boolean): Observable<void> {
    //   console.log(songId, liked);
    //   const songRef = doc(this.firestore, `songs/${songId}`);
    //   const likedSongsPlaylistId = 'lkdsngs';
    //   const playlistRef = doc(this.firestore, `playlists/${likedSongsPlaylistId}`);
    //   const dateAdded = new Date().toISOString();
    //   console.log(songRef, likedSongsPlaylistId,playlistRef,dateAdded);
  
    //   return new Observable<void>(observer => {
    //     Promise.all([
    //       setDoc(songRef, { liked }, { merge: true }),
    //       liked
    //         ? updateDoc(playlistRef, {
    //             songs: arrayUnion({ songId, dateAdded })
    //           })
    //         : updateDoc(playlistRef, {
    //             songs: arrayRemove(...(this.playlistsService.getPlaylistById(likedSongsPlaylistId).pipe(
    //               map(playlist => playlist?.songs.filter(s => s.songId === songId) || [])
    //             ).subscribe().unsubscribe(), []))
    //           })
    //     ])
    //       .then(() => {
    //         observer.next();
    //         observer.complete();
    //       })
    //       .catch(err => {
    //         console.error(`Error toggling liked for song ${songId}:`, err);
    //         observer.error(err);
    //       });
    //   });
    // }
  
    // Get liked songs
    getLikedSongs(): Observable<Song[]> {
      const likedSongsPlaylistId = 'lkdsngs';
      return this.getSongsByPlaylistId(likedSongsPlaylistId).pipe(
        map(playlistSongs => playlistSongs.map(item => item.song))
      );
    }
}