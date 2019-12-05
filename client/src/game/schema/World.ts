// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.5
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { Player } from "./Player"
import { GameObject } from "./GameObject"

export class World extends Schema {
    @type("uint32") public width: number;
    @type("uint32") public height: number;
    @type({ map: Player }) public players: MapSchema<Player> = new MapSchema<Player>();
    @type({ map: GameObject }) public gameObjects: MapSchema<GameObject> = new MapSchema<GameObject>();

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
