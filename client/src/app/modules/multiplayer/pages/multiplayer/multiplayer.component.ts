import { Component, OnInit } from '@angular/core';
import * as Colyseus from 'colyseus.js';
import { GenerateMap } from 'mapgeneration/MapGenerator';
import { World } from 'gamecommon/game/schema/World';
import { Main } from 'gamecommon/game/core/Main';
import { MapGraphics } from '@game/map/MapGraphics';
import { GameObjectFactoryClient } from '@game/object/GameObjectFactoryClient';
import { Controls } from '@game/core/Controls';
import { Input } from 'gamecommon/game/core/InputTypes';
import * as clipperLib from 'gamecommon/game/map/js-angusj-clipper'; // es6 / typescript
import { Map } from 'gamecommon/game/map/Map';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit {

  public controls: Controls;
  public input: Input;
  public map: MapGraphics;
  public mapClipper: any;

  constructor() { }

  ngOnInit() {
    // Connect to server
    const client = new Colyseus.Client('ws://localhost:2568');

    // Generate the map
    GenerateMap().then((map) => {

      console.log('Generated map. Creating room ...');

      // Make a room with map
      client.joinOrCreate<World>('battle', { map }).then(room => {
        console.log('Created room successfully', room);

        this.startGameLoop(room.state);

        room.state.gameObjects.onAdd = (gameObjectSchema, sessionId: string) => {
          // console.log("Creating gameobject", gameObjectSchema.objectType, gameObjectSchema);
        };

        room.state.players.onAdd = (player, sessionId: string) => {
          if (room.sessionId === player.name) {
            console.log("Created your player", player.name, player);
          } else {
            console.log("Creating player", player.name, player);
          }
          this.map.AddPlayer(player, sessionId);
        };

        room.state.groundObjects.onAdd = (ground, sessionId: string) => {
          // console.log("Creating ground", ground.objectType, sessionId, ground);
          this.map.AddGround(ground);
        };
        room.state.groundObjects.onRemove = (ground, sessionId: string) => {
          // console.log("Destroying ground", ground.objectType);
        };


      }).catch(e => {
        console.error('Create room error', e);
      });
    });

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
  }

  public startGameLoop(world: World): MapGraphics {
    let game: Main;

    this.input = new Input();
    this.controls = new Controls(this.input);
    const gameObjectFactory = new GameObjectFactoryClient();
    const map = this.map = MapGraphics.CreateFromWorld(world, gameObjectFactory);

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

    return map;
  }
}