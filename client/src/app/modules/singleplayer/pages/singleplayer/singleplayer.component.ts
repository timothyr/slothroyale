import { Component, AfterViewInit } from '@angular/core';
import { Main } from 'gamecommon/game/core/Main';
import { GenerateMap } from 'mapgeneration/MapGenerator';

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

    GenerateMap().then((map) => {

      const loop = (time: number) => {
        window.requestAnimationFrame(loop);
        game.SimulationLoop(time);
      };

      const init = (time: number) => {
        game = new Main(time);
        game.LoadLevel(map);
        window.requestAnimationFrame(loop);
      };

      window.requestAnimationFrame(init);

    });


  }

}
