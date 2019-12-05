import { Room, Client, serialize, SchemaSerializer } from "colyseus";
import { Main } from 'gamecommon/game/core/Main';
import { Map } from "gamecommon/game/map/Map";
import { GameObjectFactoryServer } from "gamecommon/game/object/GameObjectFactory";
import { Input } from "gamecommon/game/core/InputTypes";
import * as clipperLib from "js-angusj-clipper"; // es6 / typescript
import { World } from "gamecommon/game/schema/World";
import { Schema } from "@colyseus/schema";

export class UselessSchema extends Schema {}

@serialize(SchemaSerializer)
export class GameRoom extends Room<World> {

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
    const map: any = Map.Create(options.map, gameObjectFactory);

    // <hack> to get around SchemaSerializer:12 in setState()
    const mapProto = map.__proto__;
    const newWorld: any = new UselessSchema();
    map.__proto__ = newWorld.__proto__

    this.setState(map);

    map.__proto__ = mapProto;
    // </hack>

    map.setMapClipper(this.mapClipper);

    game.LoadMap(map);

    this.setSimulationInterval((deltaTime) => game.SimulationLoop(deltaTime));
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
