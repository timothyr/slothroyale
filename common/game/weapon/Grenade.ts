import { GameObject } from '../object/GameObject';
import { b2World, b2Body, b2BodyDef, b2BodyType, b2CircleShape, b2Vec2, b2Cos, b2DegToRad, b2Sin, b2FixtureDef } from '@flyover/box2d';
import { ObjectType, UserData } from '../object/UserData';

export class Grenade extends GameObject {

  public static readonly grenadeSize: number = 0.5;

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
      localUUID: this.getLocalUUID()
    };

    const shape = new b2CircleShape();
    shape.m_radius = Grenade.grenadeSize;

    const projectileFixtureDef = new b2FixtureDef();
    projectileFixtureDef.shape = shape;
    projectileFixtureDef.userData = projectileUserData;

    this.sensorFixture = body.CreateFixture(projectileFixtureDef, 0);

    return body;
  }
}
