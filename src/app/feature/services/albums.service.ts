import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, query, where, onSnapshot, collectionData, setDoc, docData } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { Album } from '../../../interfaces/album.interface';

@Injectable({
  providedIn: 'root'
})
export class AlbumsService {
  constructor(private firestore: Firestore) {}

  // Fetch all albums (one-time read)
  getAlbums(): Observable<Album[]> {
    const albumsRef = collection(this.firestore, 'albums');
    return new Observable<Album[]>(observer => {
      getDocs(albumsRef)
        .then(snapshot => {
          const albums = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            type: 'album'
          } as Album));
          observer.next(albums);
          observer.complete();
        })
        .catch(err => {
          console.error('Error fetching albums:', err);
          observer.next([]);
          observer.complete();
        });
    });
  }
   // Fetch single album by ID with real-time updates
   getAlbumById(id: string): Observable<Album | null> {
    const albumRef = doc(this.firestore, `albums/${id}`);
    return docData(albumRef, { idField: 'id' }).pipe(
      map(album => (album ? { ...album, type: 'album' } as Album : null)),
      catchError(err => {
        console.error(`Error fetching album with ID ${id}:`, err);
        return of(null);
      })
    );
  }
   // Fetch albums with inLibrary: true with real-time updates
   getAlbumsInLibrary(): Observable<Album[]> {
    const albumsRef = collection(this.firestore, 'albums');
    const q = query(albumsRef, where('inLibrary', '==', true));
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs.map(doc => ({ ...doc, type: 'album' } as Album))),
      catchError(err => {
        console.error('Error syncing albums:', err);
        return of([]);
      })
    );
  }
  // Toggle inLibrary field for an album
  toggleAlbumInLibrary(albumId: string, inLibrary: boolean): Observable<void> {
    const albumRef = doc(this.firestore, `albums/${albumId}`);
    return new Observable<void>(observer => {
      setDoc(albumRef, { inLibrary }, { merge: true })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => {
          console.error(`Error updating inLibrary for album ${albumId}:`, err);
          observer.error(err);
        });
    });
  }

  // Fetch single album by ID (already optimized with docData)
  // getAlbumById(id: string): Observable<Album | null> {
  //   const albumRef = doc(this.firestore, `albums/${id}`);
  //   return new Observable<Album | null>(observer => {
  //     getDoc(albumRef)
  //       .then(docSnap => {
  //         if (docSnap.exists()) {
  //           observer.next({ ...docSnap.data(), id: docSnap.id, type: 'album' } as Album);
  //         } else {
  //           observer.next(null);
  //         }
  //         observer.complete();
  //       })
  //       .catch(err => {
  //         console.error(`Error fetching album with ID ${id}:`, err);
  //         observer.next(null);
  //         observer.complete();
  //       });
  //   });
  // }

  // Fetch multiple albums by IDs (optimized with getDocs)
  getAlbumsByIds(albumIds: string[]): Observable<{ [albumId: string]: Album | null }> {
    if (!albumIds || albumIds.length === 0) {
      return of({});
    }

    // Remove duplicates
    const uniqueAlbumIds = [...new Set(albumIds)];

    // Firestore 'in' query supports up to 30 IDs
    const batchSize = 30;
    const batches: string[][] = [];
    for (let i = 0; i < uniqueAlbumIds.length; i += batchSize) {
      batches.push(uniqueAlbumIds.slice(i, i + batchSize));
    }

    // Fetch albums in batches
    const batchPromises = batches.map(batch => {
      const albumsRef = collection(this.firestore, 'albums');
      const q = query(albumsRef, where('__name__', 'in', batch)); // Use __name__ for document IDs
      return getDocs(q)
        .then(snapshot => {
          const albumMap: { [albumId: string]: Album | null } = {};
          batch.forEach(albumId => {
            const doc = snapshot.docs.find(d => d.id === albumId);
            albumMap[albumId] = doc
              ? { ...doc.data(), id: doc.id, type: 'album' } as Album
              : null;
          });
          return albumMap;
        })
        .catch(err => {
          console.error('Error fetching albums:', err);
          const albumMap: { [albumId: string]: Album | null } = {};
          batch.forEach(albumId => (albumMap[albumId] = null));
          return albumMap;
        });
    });

    // Combine batch results
    return new Observable<{ [albumId: string]: Album | null }>(observer => {
      Promise.all(batchPromises)
        .then(batchResults => {
          const combined = batchResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          observer.next(combined);
          observer.complete();
        })
        .catch(err => {
          console.error('Error combining album batches:', err);
          observer.next({});
          observer.complete();
        });
    });
  }
}