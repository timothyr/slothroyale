import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'singleplayer',
    loadChildren: () => import('./modules/singleplayer/singleplayer.module').then(mod => mod.SingleplayerModule)
  },
  {
    path: 'multiplayer',
    loadChildren: () => import('./modules/multiplayer/multiplayer.module').then(mod => mod.MultiplayerModule)
  },
  {
    path: '',
    redirectTo: 'singleplayer',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
