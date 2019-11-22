import { Component, AfterViewInit } from '@angular/core';
import { Main } from 'gamecommon/game/core/Main';
import { GenerateMap } from 'mapgeneration/MapGenerator';
import { MapGraphics } from '@game/map/MapGraphics';
import { GameObjectFactoryClient } from '@game/object/GameObjectFactoryClient';
import { Controls } from '@game/core/Controls';
import { Input } from 'gamecommon/game/core/InputTypes';

@Component({
  selector: 'app-singleplayer',
  templateUrl: './singleplayer.component.html',
  styleUrls: ['./singleplayer.component.scss']
})
export class SingleplayerComponent implements AfterViewInit {

  public controls: Controls;
  public input: Input;

  public ngAfterViewInit(): void {
    this.startGameLoop();
  }

  public startGameLoop(): void {
    let game: Main;

    GenerateMap().then((mapOptions) => {

      this.input = new Input();
      this.controls = new Controls(this.input);
      const gameObjectFactory = new GameObjectFactoryClient();
      const map = MapGraphics.Create(mapOptions, gameObjectFactory);

      const loop = (time: number) => {
        window.requestAnimationFrame(loop);
        game.SimulationLoop(time);
      };

      const init = (time: number) => {
        game = new Main(time, this.input);
        game.LoadMap(map);
        window.requestAnimationFrame(loop);
      };

      window.requestAnimationFrame(init);

    });


  }

}
