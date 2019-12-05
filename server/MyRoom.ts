import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Main } from 'gamecommon/game/core/Main';
import { Map } from "gamecommon/game/map/Map";
import { GameObjectFactoryServer } from "gamecommon/game/object/GameObjectFactory";
import { Input } from "gamecommon/game/core/InputTypes";
import * as clipperLib from "js-angusj-clipper"; // es6 / typescript

export class GameObject extends Schema {
  @type("uint16") public objectId: number;
  @type("uint8") public objectType: number;
  @type("int32") public x: number; // convert box2d to int32 by * 10^5
  @type("int32") public y: number; // convert box2d to int32 by * 10^5
}

export class Player extends GameObject {
  @type("string") public name: string;
}

export class World extends Schema {
  @type("uint32") public width: number;
  @type("uint32") public height: number;
  @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
  @type({ map: GameObject }) public gameObjects: MapSchema<GameObject> = new MapSchema<GameObject>();
}

export class MyRoom extends Room {

  mapClipper: any;

  constructor() {
    super()

    clipperLib.loadNativeClipperLibInstanceAsync(
      // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
      clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
    ).then((clipper) => {
      this.mapClipper = clipper;
    });
  }

  onCreate (options: any) {
    // console.log("options", options);
    
    let game: Main;
    game = new Main(0, new Input());
    const gameObjectFactory = new GameObjectFactoryServer();
    const map = Map.Create(options.map, gameObjectFactory);
    
    map.setMapClipper(this.mapClipper);

    game.LoadMap(map);
  }

  onJoin (client: Client, options: any) {
  }

  onMessage (client: Client, message: any) {
  }

  onLeave (client: Client, consented: boolean) {
  }

  onDispose() {
  }

}
