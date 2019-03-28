import * as box2d from '@flyover/box2d';
import { Input, MoveX } from '@game/core/Input';

const PLAYER_MIN_ANGLE = -90 - 70;
const PLAYER_MAX_ANGLE = -90 + 70;

export interface PlayerMovement {
  minAngle: number;
  maxAngle: number;
  velocity: number;
  moveX: MoveX;
}

export class Player {

  body: box2d.b2Body;
  sensorFixture: box2d.b2Fixture;
  playerMovement: PlayerMovement;
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

    this.playerMovement = {
      minAngle: box2d.b2DegToRad(PLAYER_MIN_ANGLE),
      maxAngle: box2d.b2DegToRad(PLAYER_MAX_ANGLE),
      velocity: 0,
      moveX: MoveX.NONE
    }

    const playerSensorFixtureDef = new box2d.b2FixtureDef();
    playerSensorFixtureDef.shape = circle;
    playerSensorFixtureDef.friction = 10000000;
    playerSensorFixtureDef.userData = this.playerMovement;
    this.sensorFixture = this.body.CreateFixture(playerSensorFixtureDef, 0);

    this.body.SetBullet(true);
    this.body.SetFixedRotation(true);
    this.body.SetSleepingAllowed(true); // set only on players turn?
  }

  handleInput(input: Input) {
    const vel: box2d.b2Vec2 = this.body.GetLinearVelocity();

    if(Math.abs(vel.x) < 1 && input.moveX === MoveX.NONE && !this.stopped) {
      vel.x = 0;
      this.body.SetLinearVelocity(vel);
      this.body.SetSleepingAllowed(true);
      // this.body.SetAwake(false);
      this.stopped = true;
    }

    if (vel.x || input.moveX !== MoveX.NONE) {
      if(this.stopped) {
        this.body.SetSleepingAllowed(false);
        this.stopped = false;
      }

      let velocity = 0;

      switch (input.moveX) {
        case MoveX.LEFT:
          velocity = -2;
          break;
        case MoveX.RIGHT:
          velocity = 2;
          break;
      }

      this.sensorFixture.SetUserData({
        ...this.playerMovement,
        velocity,
        moveX: input.moveX
      });
    }
  }
}