import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleplayerComponent } from './pages/singleplayer/singleplayer.component';
import { RouterModule } from '@angular/router';
import { routes } from './singleplayer.routes';

@NgModule({
  declarations: [SingleplayerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SingleplayerModule { }
