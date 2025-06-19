import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MediaCardListComponent } from './components/media-card-list/media-card-list.component';
import { PlaylistsService } from '../../../feature/services/playlists.service';


@Component({
  selector: 'app-side-panel',
  imports: [MediaCardListComponent],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css'
})
export class SidePanelComponent {
  constructor(
    private playlistsService: PlaylistsService,
    private router: Router
  ) {}

  createPlaylist() {
    this.playlistsService.createPlaylist().subscribe(playlistId => {
      this.router.navigate([`/playlist/${playlistId}`]);
    });
  }
}