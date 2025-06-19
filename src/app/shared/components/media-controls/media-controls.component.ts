import { Component, input, OnInit, output, signal } from '@angular/core';
import { PlayPauseComponent } from "../../../common/components/play-pause/play-pause.component";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faEllipsis, faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AlbumsService } from '../../../feature/services/albums.service';
import { PlaylistsService } from '../../../feature/services/playlists.service';
import { Router } from '@angular/router';
import { DropdownComponent } from "../../../common/components/dropdown/dropdown.component";

// import { faArrowDown }  from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-media-controls',
  imports: [PlayPauseComponent, FaIconComponent, DropdownComponent],
  templateUrl: './media-controls.component.html',
  styleUrl: './media-controls.component.css'
})
export class MediaControlsComponent implements OnInit {
  mediaType = input<'album' | 'playlist' | undefined>();
  mediaId = input<string | undefined>();
  faPlus = faPlus;
  faCheck = faCheck;
  faEllipsis = faEllipsis;
  inLibrary = signal(false);
  showDropdown = signal(false);
  onEdit = output<void>();
  private subscription: Subscription = new Subscription();

  constructor(
    private albumsService: AlbumsService,
    private playlistsService: PlaylistsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.mediaType() === 'album' && this.mediaId()) {
      this.subscription.add(
        this.albumsService.getAlbumById(this.mediaId()!).subscribe(album => {
          this.inLibrary.set(album?.inLibrary ?? false);
        })
      );
    } else if (this.mediaType() === 'playlist' && this.mediaId()) {
      this.subscription.add(
        this.playlistsService.getPlaylistById(this.mediaId()!).subscribe(playlist => {
          this.inLibrary.set(playlist?.inLibrary ?? false);
        })
      );
    }
  }

  toggleLibrary(): void {
    if (this.mediaType() === 'album' && this.mediaId()) {
      const newInLibrary = !this.inLibrary();
      this.albumsService.toggleAlbumInLibrary(this.mediaId()!, newInLibrary).subscribe({
        next: () => this.inLibrary.set(newInLibrary),
        error: err => console.error('Failed to toggle library:', err)
      });
    } else if (this.mediaType() === 'playlist' && this.mediaId()) {
      const newInLibrary = !this.inLibrary();
      this.playlistsService.togglePlaylistInLibrary(this.mediaId()!, newInLibrary).subscribe({
        next: () => this.inLibrary.set(newInLibrary),
        error: err => console.error('Failed to toggle library:', err)
      });
    }
  }

  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
  }

  handleDropdownSelect(option: string): void {
    if(option === 'Edit' && this.mediaId()){
      console.log('HI');
      this.onEdit.emit();
    }
    if (option === 'Delete' && this.mediaId()) {
      this.playlistsService.deletePlaylist(this.mediaId()!).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
    this.showDropdown.set(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}