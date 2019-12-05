// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.5
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { PlayerSchema } from "./Player"
import { GameObjectSchema } from "./GameObject"

export class World extends Schema {
    @type("uint32") public width: number;
    @type("uint32") public height: number;
    @type({ map: PlayerSchema }) public players: MapSchema<PlayerSchema> = new MapSchema<PlayerSchema>();
    @type({ map: GameObjectSchema }) public gameObjects: MapSchema<GameObjectSchema> = new MapSchema<GameObjectSchema>();

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
