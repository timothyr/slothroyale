import { GameObject } from '@game/object/GameObject';
import { b2World, b2Body, b2BodyDef, b2BodyType, b2CircleShape } from '@flyover/box2d';
import * as PIXI from 'pixi.js';
import { metersToPixel } from '@game/graphics/Pixi';

const size = 0.5;

export class Grenade extends GameObject {

  createBody(world: b2World): b2Body {
    const bd = new b2BodyDef();
    bd.type = b2BodyType.b2_dynamicBody;
    const body = world.CreateBody(bd);
    const shape = new b2CircleShape();
    shape.m_radius = size;
    body.CreateFixture(shape);

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
