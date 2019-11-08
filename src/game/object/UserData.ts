export const enum ObjectType {
  GROUND,
  PLAYER,
  PROJECTILE
}

export interface UserData {
  objectType: ObjectType;
  displayObject: PIXI.DisplayObject;
}
