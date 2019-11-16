import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { MultiplayerModule } from './modules/multiplayer/multiplayer.module';
import { SingleplayerModule } from './modules/singleplayer/singleplayer.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SingleplayerModule,
    MultiplayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
