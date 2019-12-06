import { Schema, type, DataChange } from "@colyseus/schema";
import { ObjectType } from '../object/UserData';

export class GameObjectSchema extends Schema {
  @type("int32") public localUUID: number;
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
