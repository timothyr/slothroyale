import { b2Body, b2World, b2Vec2, b2Fixture } from '@flyover/box2d';
import { UserData } from './UserData';
import { LocalUUIDGenerator } from './LocalUUIDGenerator';

export abstract class GameObject {
  protected sensorFixture: b2Fixture;
  protected body: b2Body;

  private localUUID: number;

  constructor(world: b2World, position?: b2Vec2, bodyParams?: any) {
    // TODO set localUUID
    const localUUIDGenerator = LocalUUIDGenerator.getInstance();
    this.localUUID = localUUIDGenerator.getNextUUID();
    console.log("new local uuid " + this.localUUID);
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

  update(): void {}

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
