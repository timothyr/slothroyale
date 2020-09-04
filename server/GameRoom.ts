import { Room, Client } from "colyseus";
import { Main } from 'gamecommon/game/core/Main';
import { Map } from "gamecommon/game/map/Map";
import { GameObjectFactoryServer } from "gamecommon/game/object/GameObjectFactory";
import { Input } from "gamecommon/game/core/InputTypes";
import * as clipperLib from "js-angusj-clipper"; // es6 / typescript
import { World } from "gamecommon/game/schema/World";
import { Schema } from "@colyseus/schema";

export class UselessSchema extends Schema {}

// @serialize(SchemaSerializer)
export class GameRoom extends Room<World> {

  mapClipper: any;
  map: Map;

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
    // console.log("Creating room");
    
    let game: Main;
    game = new Main(0, new Input());
    const gameObjectFactory = new GameObjectFactoryServer();
    this.map = Map.Create(options.map, gameObjectFactory);

    // const mapProto = map.__proto__;
    // const mapHack: any = new UselessSchema();
    
    // <hack> to get around SchemaSerializer:12 in setState()
    // map.__proto__ = mapHack.__proto__;

    this.setState(this.map);

    // map.__proto__ = mapProto;
    // </hack>
    
    this.map.setMapClipper(this.mapClipper);

    game.LoadMap(this.map);

    this.setSimulationInterval((deltaTime) => game.SimulationLoop(deltaTime), 16.6);

    this.onMessage("action", (client: Client, input: Input) => {
      // console.log("client msg", client.sessionId, input);
      this.map.UpdatePlayerInputFromServer(client.sessionId, input);
    })
  }

  onJoin (client: Client, options: any) {
    console.log("Creating player", client.sessionId);
    this.map.CreatePlayer(client.sessionId);
  }

  onLeave (client: Client, consented: boolean) {
  }

  onDispose() {
  }

}