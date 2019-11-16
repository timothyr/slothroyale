import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class GameObject extends Schema {
  @type("uint8")
  objectType: number = 0;

  @type("int32") // convert box2d to int32 by * 10^5
  x: number = 0;

  @type("int32") // convert box2d to int32 by * 10^5
  y: number = 0;
}

export class Player extends GameObject {
  @type("string")
  name: string = '';
}

export class World extends Schema {
  @type("uint32")
  width: number = 0;

  @type("uint32")
  height: number = 0;

  // TODO ground 
  // mapschema or arrayschema?

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: GameObject })
  gameObjects = new MapSchema<GameObject>();

}



export class MyRoom extends Room {

  onCreate (options: any) {
    console.log("options", options);
    // console.log("polygons")
    // options.map.polygons.forEach((polygon: any) => {
    //   console.log(polygon);
    // });
    // options.map.playerPositions.forEach((polygon: any) => {
    //   console.log(polygon);
    // });
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
