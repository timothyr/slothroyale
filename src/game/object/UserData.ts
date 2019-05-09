export const enum ObjectType {
  GROUND,
  PLAYER
}

export interface UserData {
  objectType: ObjectType;
  displayObject: PIXI.DisplayObject;
}
