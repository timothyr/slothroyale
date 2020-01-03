import { b2Body, b2World, b2Vec2, b2Fixture } from '@flyover/box2d';
import { UserData, ObjectType } from './UserData';
import { LocalUUIDGenerator } from './LocalUUIDGenerator';
import { GameObjectSchema } from '../schema/GameObject';

export abstract class GameObject extends GameObjectSchema {

  public static readonly positionMultiplier: number = 100000;


  protected sensorFixture: b2Fixture;
  protected body: b2Body;

  constructor(world: b2World, objectType: ObjectType, position?: b2Vec2, bodyParams?: any, localUUID?: number) {
    super(objectType);
    if (localUUID) {
      this.localUUID = localUUID;
    } else {
      const localUUIDGenerator = LocalUUIDGenerator.getInstance();
      this.localUUID = localUUIDGenerator.getNextUUID();
    }

    // console.log("new local uuid " + this.localUUID);
    this.body = this.createBody(world, bodyParams);
    this.setUserDataLocalUUID();

    if (position) {
      this.setPosition(position.x, position.y);
    }
  }

  abstract createBody(world: b2World, bodyParams?: any): b2Body;

  getPosition(): b2Vec2 {
    return this.body.GetPosition();
  }

  setPosition(x: number, y: number): void {
    this.body.SetPosition(new b2Vec2(x, y));
  }

  getUserData(): UserData {
    return this.sensorFixture.GetUserData();
  }

  setUserDataLocalUUID(): void {
    const localUUID = this.localUUID;
    this.sensorFixture.SetUserData({
      ...this.sensorFixture.GetUserData(),
      localUUID
    });
  }

  getLocalUUID(): number {
    return this.localUUID;
  }

  update(): void {
    const pos = this.body.GetPosition();
    this.x = pos.x * GameObject.positionMultiplier;
    this.y = pos.y * GameObject.positionMultiplier;
  }

  destroy(): void {
    this.destroyBody();
  }

  // ONLY CALL OUTSIDE TIME STEP
  private destroyBody(): void {
    if (this.body) {
      this.body.GetWorld().DestroyBody(this.body);
    }
  }
}
