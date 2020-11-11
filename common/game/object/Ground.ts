import { GameObject } from './GameObject';
import { b2World, b2Body, b2BodyDef, b2FixtureDef, b2Vec2, b2PolygonShape } from '@flyover/box2d';
import { UserData, ObjectType } from './UserData';
import { type, ArraySchema, DataChange } from '@colyseus/schema';

export class Ground extends GameObject {

  public static readonly vertexMultiplier: number = 10000000;

  @type([ "int32" ])
  vertices: ArraySchema<number>;

  constructor(world: b2World, position: b2Vec2 = null, bodyParams: any, localUUID?: number) {
    super(world, ObjectType.GROUND, null, bodyParams, localUUID);

    // Convert array in form [{x: 0, y: 1}, ...] into 1-d array of [x1, y1, x2, y2, ...]
    const convertedVertices = bodyParams.polygon.flatMap((v: b2Vec2) => [v.x * Ground.vertexMultiplier, v.y * Ground.vertexMultiplier]);

    this.vertices = new ArraySchema<number>(...convertedVertices);
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

  onChange (changes: DataChange[]) {
    // onChange logic here.
  }

  onAdd () {
    // onAdd logic here.
  }

  onRemove () {
    // onRemove logic here.
  }
}
