import * as box2d from '@flyover/box2d';
import { Input, MoveX } from '@game/core/Input';

export class Player {

  body: box2d.b2Body;
  sensorFixture: box2d.b2Fixture;
  stopped = true;

  constructor(m_world: box2d.b2World) {
    const bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    this.body = m_world.CreateBody(bd);

    const box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 1.5);
    const playerPhysicsFixture = this.body.CreateFixture(box, 0);

    const circle = new box2d.b2CircleShape();
    circle.m_p.Set(0, -1.5);
    circle.m_radius = 0.5;

    const playerSensorFixtureDef = new box2d.b2FixtureDef();
    playerSensorFixtureDef.shape = circle;
    playerSensorFixtureDef.friction = 2;
    this.sensorFixture = this.body.CreateFixture(playerSensorFixtureDef, 0);

    this.body.SetBullet(true);
    this.body.SetFixedRotation(true);
  }

  handleInput(input: Input) {
    const vel: box2d.b2Vec2 = this.body.GetLinearVelocity();

    if(input.moveX === MoveX.NONE && !this.stopped) {
      this.sensorFixture.SetFriction(10000000);
      this.stopped = true;
    }

    if (vel.x || input.moveX !== MoveX.NONE) {
      if(this.stopped) {
        this.sensorFixture.SetFriction(2);
        this.stopped = false;
      }

      let desiredX = 0;

      switch (input.moveX) {
        case MoveX.LEFT:
          // move left
          desiredX = -2;
          break;
        case MoveX.RIGHT:
          // move right
          desiredX = 2;
          break;
        case MoveX.NONE:
          break;
      }

      const velChange: number = desiredX - vel.x;
      const impulse: any = this.body.GetMass() * velChange;

      this.body.ApplyLinearImpulse(new box2d.b2Vec2(impulse, 0), this.body.GetWorldCenter(), true);
    }
  }
}