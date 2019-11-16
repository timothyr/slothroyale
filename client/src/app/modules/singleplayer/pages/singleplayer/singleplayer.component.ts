import { Component, AfterViewInit } from '@angular/core';
import { Main } from '@game/core/Main';

@Component({
  selector: 'app-singleplayer',
  templateUrl: './singleplayer.component.html',
  styleUrls: ['./singleplayer.component.scss']
})
export class SingleplayerComponent implements AfterViewInit {

  public ngAfterViewInit(): void {
    this.startGameLoop();
  }

  public startGameLoop(): void {
    let game: Main;

    const loop = (time: number) => {
      window.requestAnimationFrame(loop);
      game.SimulationLoop(time);
    };

    const init = (time: number) => {
      game = new Main(time);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(init);
  }

}
