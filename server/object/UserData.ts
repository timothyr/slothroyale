export const enum ObjectType {
  GROUND,
  PLAYER,
  PROJECTILE
}

export interface UserData {
  objectType: ObjectType;
  localUUID: number;
}
