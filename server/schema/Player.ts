// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.5
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { GameObjectSchema } from "./GameObject"
import { ObjectType } from '../object/UserData';

export class PlayerSchema extends GameObjectSchema {
    @type("string") public name: string;

    constructor () {
        super(ObjectType.PLAYER);

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
