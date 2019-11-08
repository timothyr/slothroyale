import { b2Body, b2World, b2Vec2, b2Fixture } from '@flyover/box2d';
import { gfx } from '@game/graphics/Pixi';
import { UserData } from './UserData';

export abstract class GameObject {
  protected sensorFixture: b2Fixture;
  protected body: b2Body;
  protected sprite: PIXI.Sprite | PIXI.Graphics;
  protected displayObject: PIXI.DisplayObject;

  constructor(world: b2World, position: b2Vec2) {
    this.sprite = this.createSprite();
    this.displayObject = gfx.stage.addChild(this.sprite);
    this.body = this.createBody(world);

    this.setPosition(position.x, position.y);
  }

  abstract createBody(world: b2World): b2Body;

  abstract createSprite(): PIXI.Sprite | PIXI.Graphics;

  getSprite(): PIXI.Sprite | PIXI.Graphics {
    return this.sprite;
  }

  updateSprite(): void {
    const worldCenter = this.body.GetWorldCenter();
    this.sprite.position.set(worldCenter.x * gfx.metersToPixel, -worldCenter.y * gfx.metersToPixel);
  }

  getPosition(): b2Vec2 {
    return this.body.GetPosition();
  }

  setPosition(x: number, y: number): void {
    this.body.SetPosition(new b2Vec2(x, y));
  }

  getUserData(): UserData {
    return this.sensorFixture.GetUserData();
  }

  // ONLY CALL OUTSIDE TIME STEP
  destroyBody(): void {
    if (this.body) {
      this.body.GetWorld().DestroyBody(this.body);
    }
  }

  destroySprite(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
