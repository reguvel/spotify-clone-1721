import { Component, ElementRef, Input, input, OnInit, ViewChild } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HomeMediaCardComponent } from '../home-media-card/home-media-card.component';
import { MediaItem } from '../../../../../interfaces/mediaItem.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RecentlyPlayedService } from '../../../services/recently-played.service';
import { Router } from '@angular/router';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { isAlbum, isPlaylist } from '../../../../../interfaces/mediaItem-typeguards';
import { SongsService } from '../../../services/songs.service';
import { Song } from '../../../../../interfaces/song.interface';

@Component({
  selector: 'app-home-media-list',
  imports: [CommonModule, HomeMediaCardComponent, FaIconComponent],
  templateUrl: './home-media-list.component.html',
  styleUrl: './home-media-list.component.css'
})
export class HomeMediaListComponent implements OnInit {
  mediaList= input<MediaItem[]>();
  showLeftButton = false;
  showRightButton = false;
  faLeft = faChevronLeft;
  faRight =faChevronRight;
  listHeading=input('');
  @ViewChild('cardList', { static: false }) cardList!: ElementRef<HTMLElement>;

  isAlbum = isAlbum;
  isPlaylist = isPlaylist;

  constructor(private recentlyPlayedService: RecentlyPlayedService, private songsService: SongsService,private router: Router) {}

  ngOnInit(): void {
    // Fetch the 10 most recent items
    // this.recentlyPlayed$ = this.recentlyPlayedService.getRecentlyPlayed(10);
  }
  navigateToAlbum(albumId:string | undefined){
    this.router.navigate(['album', albumId]); 
  }
  navigateToPlaylist(playlistId:string | undefined){
    this.router.navigate(['playlist', playlistId]);
  }
  // Handle scroll event to toggle button visibility
  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    this.showLeftButton = container.scrollLeft > 0;
    this.showRightButton = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
  }

  // Scroll left
  scrollLeft(container: HTMLElement): void {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  // Scroll right
  scrollRight(container: HTMLElement): void {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  }
  
  //Redundant from SidePanel MediaList
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
}

