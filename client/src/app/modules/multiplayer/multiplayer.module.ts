import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiplayerComponent } from './pages/multiplayer/multiplayer.component';
import { RouterModule } from '@angular/router';
import { routes } from './multiplayer.routes';

@NgModule({
  declarations: [MultiplayerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MultiplayerModule { }
