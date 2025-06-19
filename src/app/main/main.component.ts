import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';


@Component({
  selector: 'app-main',
  imports: [HeaderComponent, SidePanelComponent, DashboardComponent, AudioPlayerComponent, RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
}
