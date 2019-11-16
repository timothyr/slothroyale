import { GameObject } from '@game/object/GameObject';
import { b2World, b2Body, b2BodyDef, b2BodyType, b2CircleShape, b2Vec2, b2Cos, b2DegToRad, b2Sin, b2FixtureDef } from '@flyover/box2d';
import * as PIXI from 'pixi.js';
import { metersToPixel } from '@game/graphics/Pixi';
import { ObjectType, UserData } from '@game/object/UserData';

const size = 0.5;

export class Grenade extends GameObject {

  constructor(world: b2World, position: b2Vec2, aimAngle: number, direction: number) {
    super(world, position);

    const vx = (12 * b2Sin(b2DegToRad(aimAngle)) * direction);
    const vy = - (12 * b2Cos(b2DegToRad(aimAngle)));

    this.body.SetLinearVelocity(new b2Vec2(vx, vy));
  }

  createBody(world: b2World): b2Body {

    const bd = new b2BodyDef();
    bd.type = b2BodyType.b2_dynamicBody;
    const body = world.CreateBody(bd);

    const projectileUserData: UserData = {
      objectType: ObjectType.PROJECTILE,
      displayObject: this.displayObject
    };

    const shape = new b2CircleShape();
    shape.m_radius = size;

    const projectileFixtureDef = new b2FixtureDef();
    projectileFixtureDef.shape = shape;
    projectileFixtureDef.userData = projectileUserData;

    this.sensorFixture = body.CreateFixture(projectileFixtureDef, 0);

    return body;
  }

  createSprite(): PIXI.Sprite | PIXI.Graphics {
    const graphics = new PIXI.Graphics();

    graphics.lineStyle(0);
    graphics.beginFill(0xF500FA, 1);
    graphics.drawCircle(0, 0, size * metersToPixel);
    graphics.endFill();

    return graphics;
  }
}
