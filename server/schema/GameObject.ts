// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.5
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { ObjectType } from '../object/UserData';


export class GameObjectSchema extends Schema {
    @type("uint8") public objectType: number;
    @type("int32") public x: number;
    @type("int32") public y: number;

    constructor (objectType: ObjectType) {
        super();

        this.objectType = objectType;
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
