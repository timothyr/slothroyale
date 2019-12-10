import { Schema, type, MapSchema, DataChange } from "@colyseus/schema";
import { GameObjectSchema } from "./GameObject"
import { Ground } from '../object/Ground';
import { Player } from '../player/Player';

export class World extends Schema {
  @type("uint8") public mapWidthPx: number;
  @type("uint8") public mapHeightPx: number;

  // @type({ map: PlayerSchema }) public players: MapSchema<PlayerSchema> = new MapSchema<PlayerSchema>();
  @type({ map: GameObjectSchema }) public gameObjects: MapSchema<GameObjectSchema> = new MapSchema<GameObjectSchema>();
  @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
  @type({ map: Ground }) public groundObjects: MapSchema<Ground> = new MapSchema<Ground>();

  constructor () {
    super();

    // initialization logic here.
  }

  onChange (changes: DataChange[]) {
    // onChange logic here.
  }

  onAdd () {
    // onAdd logic here.
  }

  onRemove () {
    // onRemove logic here.
  }

}
