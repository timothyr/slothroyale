import { GameObject } from './GameObject';
import { b2World, b2Body, b2BodyDef, b2FixtureDef, b2Vec2, b2PolygonShape } from '@flyover/box2d';
import { UserData, ObjectType } from './UserData';

export class Ground extends GameObject {

  constructor(world: b2World, position: b2Vec2 = null, bodyParams: any) {
    super(world, ObjectType.GROUND, null, bodyParams);
  }

  createBody(world: b2World, bodyParams: any): b2Body {

    const bd = new b2BodyDef();
    const ground = world.CreateBody(bd);
  
    // Set shape
    const shape = new b2PolygonShape();
    shape.Set(bodyParams.polygon, bodyParams.polygon.length);
  
    // Set UserData to ground
    const groundUserData: UserData = {
      objectType: ObjectType.GROUND,
      localUUID: this.getLocalUUID()
    };
  
    // Create ground fixture
    const groundFixtureDef = new b2FixtureDef();
    groundFixtureDef.shape = shape;
    groundFixtureDef.userData = groundUserData;
    this.sensorFixture = ground.CreateFixture(groundFixtureDef, 0);

    return ground;
  }
}
