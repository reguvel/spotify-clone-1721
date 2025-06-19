import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { HomeComponent } from './feature/home/home.component';
import { AlbumComponent } from './feature/album/album.component';
import { PlaylistComponent } from './feature/playlist/playlist.component';
import { DashboardComponent } from './main/components/dashboard/dashboard.component';


export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: '',
                component: DashboardComponent,
                children: [
                    {
                        path: 'home',
                        component: HomeComponent
                    },
                    {
                        path: 'album/:id',
                        component: AlbumComponent
                    },
                    {
                        path: 'playlist/:id',
                        component: PlaylistComponent
                    }
                ]
            }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
