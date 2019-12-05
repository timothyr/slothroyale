import { Component, AfterViewInit } from '@angular/core';
import { Main } from 'gamecommon/game/core/Main';
import { GenerateMap } from 'mapgeneration/MapGenerator';
import { MapGraphics } from '@game/map/MapGraphics';
import { GameObjectFactoryClient } from '@game/object/GameObjectFactoryClient';
import { Controls } from '@game/core/Controls';
import { Input } from 'gamecommon/game/core/InputTypes';
import * as clipperLib from 'gamecommon/game/map/js-angusj-clipper'; // es6 / typescript
import { Map } from 'gamecommon/game/map/Map';


@Component({
  selector: 'app-singleplayer',
  templateUrl: './singleplayer.component.html',
  styleUrls: ['./singleplayer.component.scss']
})
export class SingleplayerComponent implements AfterViewInit {

  public controls: Controls;
  public input: Input;
  public map: Map;
  public mapClipper: any;

  public ngAfterViewInit(): void {
    this.startGameLoop();
  }

  public startGameLoop(): void {
    let game: Main;

    // Load clipper
    clipperLib.loadNativeClipperLibInstanceAsync(
      // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
      clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
    ).then((clipper) => {
      this.mapClipper = clipper;
      if (this.map) {
        this.map.setMapClipper(clipper);
      }
    });

    GenerateMap().then((mapOptions) => {

      this.input = new Input();
      this.controls = new Controls(this.input);
      const gameObjectFactory = new GameObjectFactoryClient();
      const map = this.map = MapGraphics.Create(mapOptions, gameObjectFactory);

      if (this.mapClipper) {
        map.setMapClipper(this.mapClipper);
      }

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
