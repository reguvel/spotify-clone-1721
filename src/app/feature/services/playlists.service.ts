// import { Injectable } from '@angular/core';
// import { collection, collectionData, doc, docData, Firestore, query, where } from '@angular/fire/firestore';
// import { catchError, combineLatest, map, Observable, of } from 'rxjs';
// import { Playlist } from '../../../interfaces/playlist.interface';

// @Injectable({
//   providedIn: 'root'
// })
// export class PlaylistsService {
//   constructor(private firestore: Firestore
//   ) { }

//   getPlaylists(): Observable<Playlist[]> {
//     const playlistsRef = collection(this.firestore, 'playlists');
//     return collectionData(playlistsRef, { idField: 'id' }).pipe(map(playlists => playlists.map(playlist => ({ ...playlist, type: 'playlist' } as Playlist)))) as Observable<Playlist[]>;
//   }

//   getPlaylistById(id: string): Observable<Playlist | null> {
//     const playlistRef = doc(this.firestore, `playlists/${id}`);
//     return docData(playlistRef, { idField: 'id' }).pipe(
//       map(playlist => (playlist ? { ...playlist, type: 'playlist' } as Playlist : null)),
//       catchError(err => {
//         console.error(`Error fetching playlist with ID ${id}:`, err);
//         return of(null); // Return null if the playlist doesn't exist or there's an error
//       })
//     ) as Observable<Playlist | null>;
//   }

//   // New method to fetch multiple playlists by IDs
//   getPlaylistsByIds(playlistIds: string[]): Observable<{ [playlistId: string]: Playlist | null }> {
//     if (!playlistIds || playlistIds.length === 0) {
//       return of({});
//     }

//     // Remove duplicates
//     const uniquePlaylistIds = [...new Set(playlistIds)];

//     // Firestore 'in' query supports up to 10 IDs at a time, so we batch
//     const batchSize = 10;
//     const batches: string[][] = [];
//     for (let i = 0; i < uniquePlaylistIds.length; i += batchSize) {
//       batches.push(uniquePlaylistIds.slice(i, i + batchSize));
//     }

//     // Fetch playlists in batches
//     const batchObservables = batches.map(batch => {
//       const playlistsRef = collection(this.firestore, 'playlists');
//       const q = query(playlistsRef, where('id', 'in', batch));
//       return collectionData(q, { idField: 'id' }).pipe(
//         catchError(err => {
//           console.error('Error fetching playlists:', err);
//           return of([]);
//         }),
//         map(playlists => {
//           const playlistMap: { [playlistId: string]: Playlist | null } = {};
//           const typedPlaylists = playlists.map(playlist => ({ ...playlist, type: 'playlist' } as Playlist));
//           batch.forEach(playlistId => {
//             const playlist = typedPlaylists.find(p => p.id === playlistId);
//             playlistMap[playlistId] = playlist || null;
//           });
//           return playlistMap;
//         })
//       );
//     });

//     // Combine all batch results into a single playlist map
//     return combineLatest(batchObservables).pipe(
//       map(batchResults => batchResults.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
//     )
//   }
// }

import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, query, where, collectionData, setDoc, deleteDoc, updateDoc, arrayRemove, arrayUnion, docData, addDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { Playlist } from '../../../interfaces/playlist.interface';

@Injectable({
  providedIn: 'root'
})
export class PlaylistsService {
  constructor(private firestore: Firestore) {}
  getPlaylists(): Observable<Playlist[]> {
    const playlistsRef = collection(this.firestore, 'playlists');
    return collectionData(playlistsRef, { idField: 'id' }).pipe(
      map(playlists => playlists.map(playlist => ({ ...playlist, type: 'playlist' } as Playlist))),
      catchError(err => {
        console.error('Error fetching playlists:', err);
        return of([]);
      })
    );
  }

  // Fetch single playlist by ID with real-time updates
  getPlaylistById(id: string): Observable<Playlist | null> {
    const playlistRef = doc(this.firestore, `playlists/${id}`);
    return docData(playlistRef, { idField: 'id' }).pipe(
      map(playlist => (playlist ? { ...playlist, type: 'playlist' } as Playlist : null)),
      catchError(err => {
        console.error(`Error fetching playlist with ID ${id}:`, err);
        return of(null);
      })
    );
  }

  // // Fetch all playlists (one-time read)
  // getPlaylists(): Observable<Playlist[]> {
  //   const playlistsRef = collection(this.firestore, 'playlists');
  //   return new Observable<Playlist[]>(observer => {
  //     getDocs(playlistsRef)
  //       .then(snapshot => {
  //         const playlists = snapshot.docs.map(doc => ({
  //           ...doc.data(),
  //           id: doc.id,
  //           type: 'playlist'
  //         } as Playlist));
  //         observer.next(playlists);
  //         observer.complete();
  //       })
  //       .catch(err => {
  //         console.error('Error fetching playlists:', err);
  //         observer.next([]);
  //         observer.complete();
  //       });
  //   });
  // }

  // // Fetch single playlist by ID (already optimized with docData)
  // getPlaylistById(id: string): Observable<Playlist | null> {
  //   const playlistRef = doc(this.firestore, `playlists/${id}`);
  //   return new Observable<Playlist | null>(observer => {
  //     getDoc(playlistRef)
  //       .then(docSnap => {
  //         if (docSnap.exists()) {
  //           observer.next({ ...docSnap.data(), id: docSnap.id, type: 'playlist' } as Playlist);
  //         } else {
  //           observer.next(null);
  //         }
  //         observer.complete();
  //       })
  //       .catch(err => {
  //         console.error(`Error fetching playlist with ID ${id}:`, err);
  //         observer.next(null);
  //         observer.complete();
  //       });
  //   });
  // }
   // Fetch albums with inLibrary: true with real-time updates
   getPlaylistsInLibrary(): Observable<Playlist[]> {
    const playlistsRef = collection(this.firestore, 'playlists');
    const q = query(playlistsRef, where('inLibrary', '==', true));
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => ({ ...doc, type: 'playlist' } as Playlist))),
      catchError(err => {
        console.error('Error syncing albums:', err);
        return of([]);
      })
    );
  }
  // Toggle inLibrary field for an playlist
  togglePlaylistInLibrary(playlistId: string, inLibrary: boolean): Observable<void> {
    const playlistsRef = doc(this.firestore, `playlists/${playlistId}`);
    return new Observable<void>(observer => {
      setDoc(playlistsRef, { inLibrary }, { merge: true })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => {
          console.error(`Error updating inLibrary for playlist ${playlistId}:`, err);
          observer.error(err);
        });
    });
  }

  // Fetch multiple playlists by IDs (optimized with getDocs)
  getPlaylistsByIds(playlistIds: string[]): Observable<{ [playlistId: string]: Playlist | null }> {
    if (!playlistIds || playlistIds.length === 0) {
      return of({});
    }

    // Remove duplicates
    const uniquePlaylistIds = [...new Set(playlistIds)];

    // Firestore 'in' query supports up to 30 IDs
    const batchSize = 30;
    const batches: string[][] = [];
    for (let i = 0; i < uniquePlaylistIds.length; i += batchSize) {
      batches.push(uniquePlaylistIds.slice(i, i + batchSize));
    }

    // Fetch playlists in batches
    const batchPromises = batches.map(batch => {
      const playlistsRef = collection(this.firestore, 'playlists');
      const q = query(playlistsRef, where('__name__', 'in', batch));
      return getDocs(q)
        .then(snapshot => {
          const playlistMap: { [playlistId: string]: Playlist | null } = {};
          batch.forEach(playlistId => {
            const doc = snapshot.docs.find(d => d.id === playlistId);
            playlistMap[playlistId] = doc
              ? { ...doc.data(), id: doc.id, type: 'playlist' } as Playlist
              : null;
          });
          return playlistMap;
        })
        .catch(err => {
          console.error('Error fetching playlists:', err);
          const playlistMap: { [playlistId: string]: Playlist | null } = {};
          batch.forEach(playlistId => (playlistMap[playlistId] = null));
          return playlistMap;
        });
    });

    // Combine batch results
    return new Observable<{ [playlistId: string]: Playlist | null }>(observer => {
      Promise.all(batchPromises)
        .then(batchResults => {
          const combined = batchResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          observer.next(combined);
          observer.complete();
        })
        .catch(err => {
          console.error('Error combining playlist batches:', err);
          observer.next({});
          observer.complete();
        });
    });
  }

 
  // Add song to playlist
  addSongToPlaylist(playlistId: string, songId: string): Observable<void> {
    const playlistRef = doc(this.firestore, `playlists/${playlistId}`);
    const dateAdded = new Date().toISOString();
    return new Observable<void>(observer => {
      updateDoc(playlistRef, {
        songs: arrayUnion({ songId, dateAdded })
      })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => {
          console.error(`Error adding song ${songId} to playlist ${playlistId}:`, err);
          observer.error(err);
        });
    });
  }

  // Remove song from playlist
  removeSongFromPlaylist(playlistId: string, songId: string): Observable<void> {
    const playlistRef = doc(this.firestore, `playlists/${playlistId}`);
    return this.getPlaylistById(playlistId).pipe(
      switchMap(playlist => {
        if (!playlist || !playlist.songs) {
          return of(undefined);
        }
        const songEntry = playlist.songs.find(s => s.songId === songId);
        if (!songEntry) {
          return of(undefined);
        }
        return new Observable<void>(observer => {
          updateDoc(playlistRef, {
            songs: arrayRemove(songEntry)
          })
            .then(() => {
              observer.next();
              observer.complete();
            })
            .catch(err => {
              console.error(`Error removing song ${songId} from playlist ${playlistId}:`, err);
              observer.error(err);
            });
        });
      })
    );
  }

  // Check if song is in playlists
  getPlaylistsForSong(songId: string): Observable<{ playlistId: string; name: string; inPlaylist: boolean }[]> {
    return this.getPlaylistsInLibrary().pipe(
      map(playlists => {
        return playlists.map(playlist => ({
          playlistId: playlist.id,
          name: playlist.name,
          inPlaylist: playlist.songs.some(song => song.songId === songId)
        }));
      })
    );
  }

  // Create a new playlist (one-time fetch for playlist count)
  createPlaylist(): Observable<string> {
    const playlistsRef = collection(this.firestore, 'playlists');
    return from(getDocs(playlistsRef)).pipe(
      map(snapshot => snapshot.docs.length + 1), // Get the count of existing playlists
      switchMap(playlistCount => {
        const newPlaylist: Omit<Playlist, 'id'> = {
          name: `My Playlist #${playlistCount}`,
          artist: 'User',
          img: 'assets/images/Liked_Songs_Default_Cover.png',
          liked: false,
          inLibrary: true,
          songs: [],
          year: 2025,
          description: '',
          type: 'playlist'
        };
        return from(addDoc(playlistsRef, newPlaylist)).pipe(
          map(docRef => docRef.id),
          catchError(err => {
            console.error('Error creating playlist:', err);
            throw err;
          })
        );
      })
    );
  }

// Update playlist details
updatePlaylist(playlistId: string, updates: Partial<Playlist>): Observable<void> {
  const playlistRef = doc(this.firestore, `playlists/${playlistId}`);
  return new Observable<void>(observer => {
    updateDoc(playlistRef, updates)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch(err => {
        console.error(`Error updating playlist ${playlistId}:`, err);
        observer.error(err);
      });
  });
}

// Delete a playlist
deletePlaylist(playlistId: string): Observable<void> {
  const playlistRef = doc(this.firestore, `playlists/${playlistId}`);
  return new Observable<void>(observer => {
    updateDoc(playlistRef, { inLibrary: false }).then(() => {
      observer.next();
      observer.complete();
    })
      .catch(err => {
        console.error(`Error deleting playlist ${playlistId}:`, err);
        observer.error(err);
      });
  });
}

}