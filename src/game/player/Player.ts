import * as box2d from '@flyover/box2d';
import { Input, MoveX } from '@game/core/Input';

const PLAYER_MIN_ANGLE = -90 - 70;
const PLAYER_MAX_ANGLE = -90 + 70;

export const enum PlayerDirection {
  LEFT = -1,
  RIGHT = 1
}

export interface PlayerMovement {
  minAngle: number;
  maxAngle: number;
  velocity: number;
  moveX: MoveX;
  direction: PlayerDirection;
  numFootContacts: number;
}

export class Player {

  body: box2d.b2Body;
  sensorFixture: box2d.b2Fixture;
  playerMovement: PlayerMovement;
  jumpTimer: number;
  stopped = true;

  constructor(m_world: box2d.b2World) {
    const bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    this.body = m_world.CreateBody(bd);

    const box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 0.75);
    const playerPhysicsFixture = this.body.CreateFixture(box, 0);

    const circle = new box2d.b2CircleShape();
    circle.m_p.Set(0, -0.75);
    circle.m_radius = 0.5;

    this.playerMovement = {
      minAngle: box2d.b2DegToRad(PLAYER_MIN_ANGLE),
      maxAngle: box2d.b2DegToRad(PLAYER_MAX_ANGLE),
      velocity: 0,
      moveX: MoveX.NONE,
      direction: PlayerDirection.RIGHT,
      numFootContacts: 0
    };

    this.jumpTimer = 0;

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

    if (Math.abs(vel.x) < 1 && input.moveX === MoveX.NONE && !this.stopped) {
      // Set user data to 0 velocity
      this.sensorFixture.SetUserData({
        ...this.sensorFixture.GetUserData(),
        velocity: 0,
        moveX: input.moveX
      });

      // Set x velocity to 0
      vel.x = 0;
      this.body.SetLinearVelocity(vel);
      this.body.SetSleepingAllowed(true);

      this.stopped = true;
    }

    if (vel.x || input.moveX !== MoveX.NONE) {
      if (this.stopped) {
        this.body.SetSleepingAllowed(false);
        this.stopped = false;
      }

      let velocity = 0;
      let direction: PlayerDirection;

      switch (input.moveX) {
        case MoveX.LEFT:
          direction = PlayerDirection.LEFT;
          velocity = -2;
          break;
        case MoveX.RIGHT:
          direction = PlayerDirection.RIGHT;
          velocity = 2;
          break;
      }

      this.sensorFixture.SetUserData({
        ...this.sensorFixture.GetUserData(),
        velocity,
        moveX: input.moveX,
        ...(direction) && {direction}
      });
    }

    if (input.jump && this.jumpTimer === 0 && this.canJump()) {
      const dir: number = this.sensorFixture.GetUserData().direction;
      this.body.ApplyLinearImpulse(new box2d.b2Vec2(this.body.GetMass() * 2 * dir, this.body.GetMass() * 5), this.body.GetWorldCenter());
      this.jumpTimer = 50;

      if (this.stopped) {
        this.body.SetSleepingAllowed(false);
        this.stopped = false;
      }
    }

    this.jumpTimerTick();
  }

  addNumFootContacts(num: number) {
    const p: PlayerMovement = this.sensorFixture.GetUserData();
    this.sensorFixture.SetUserData({
      ...p,
      numFootContacts: p.numFootContacts + num
    });
  }

  canJump(): boolean {
    const p: PlayerMovement = this.sensorFixture.GetUserData();
    return p.numFootContacts > 0;
  }

  jumpTimerTick(): void {
    if (this.jumpTimer > 0) {
      this.jumpTimer--;
    }
  }
}
