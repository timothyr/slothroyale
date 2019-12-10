import { Input, MoveX, MoveY } from '../core/InputTypes';
import {
  b2Vec2, b2Body, b2World, b2DegToRad, b2Fixture,
  b2BodyType, b2BodyDef, b2PolygonShape, b2CircleShape, b2FixtureDef, b2Min, b2Max
} from '@flyover/box2d';
import { UserData, ObjectType } from '../object/UserData';
import { GameObject } from '../object/GameObject';
import { type } from '@colyseus/schema';

export const enum PlayerDirection {
  LEFT = -1,
  RIGHT = 1
}

export interface PlayerMovement extends UserData {
  velocity: number;
  moveX: MoveX;
  direction: PlayerDirection;
  numFootContacts: number;
}

export class Player extends GameObject {

  public static readonly PLAYER_VELOCITY = 2;

  public static readonly PLAYER_MIN_MOVEMENT_ANGLE: number = b2DegToRad(-90 - 82);
  public static readonly PLAYER_MAX_MOVEMENT_ANGLE: number = b2DegToRad(-90 + 82);

  public static readonly AIM_MIN_ANGLE = 0;
  public static readonly AIM_MAX_ANGLE = 180;
  public static readonly AIM_MOVEMENT_RATE = 2;

  @type("string") public name: string;

  sensorFixture: b2Fixture;
  playerMovement: PlayerMovement;
  jumpTimer: number;
  stopped = true;

  direction = PlayerDirection.RIGHT;

  aimAngle = 90;

  constructor(world: b2World, position: b2Vec2, localUUID?: number, name?: string) {
    super(world, ObjectType.PLAYER, position, null, localUUID);
    if (name) {
      this.name = name;
    }
    this.x = position.x;
    this.y = position.y;
  }

  createBody(world: b2World): b2Body {
    const bd = new b2BodyDef();
    bd.type = b2BodyType.b2_dynamicBody;

    const body = world.CreateBody(bd);

    const box = new b2PolygonShape();
    box.SetAsBox(0.5, 0.75);
    const playerPhysicsFixture = body.CreateFixture(box, 0);

    const circle = new b2CircleShape();
    circle.m_p.Set(0, -0.75);
    circle.m_radius = 0.5;

    this.playerMovement = {
      objectType: ObjectType.PLAYER,
      velocity: 0,
      moveX: MoveX.NONE,
      direction: PlayerDirection.RIGHT,
      numFootContacts: 0,
      localUUID: this.getLocalUUID()
    };

    this.jumpTimer = 0;

    const playerSensorFixtureDef = new b2FixtureDef();
    playerSensorFixtureDef.shape = circle;
    playerSensorFixtureDef.friction = 10000000;
    playerSensorFixtureDef.userData = this.playerMovement;
    this.sensorFixture = body.CreateFixture(playerSensorFixtureDef, 0);

    body.SetFixedRotation(true);
    body.SetSleepingAllowed(true); // set only on players turn?

    return body;
  }

  handleInput(input: Input) {
    const vel: b2Vec2 = this.body.GetLinearVelocity();

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

      // Handle X

      switch (input.moveX) {
        case MoveX.LEFT:
          this.direction = direction = PlayerDirection.LEFT;
          velocity = -Player.PLAYER_VELOCITY;
          break;
        case MoveX.RIGHT:
          this.direction = direction = PlayerDirection.RIGHT;
          velocity = Player.PLAYER_VELOCITY;
          break;
      }

      this.sensorFixture.SetUserData({
        ...this.sensorFixture.GetUserData(),
        velocity,
        moveX: input.moveX,
        ...(direction) && { direction }
      });
    }

    // Handle Y

    switch (input.moveY) {
      case MoveY.UP:
        this.increaseAimAngle();
        break;
      case MoveY.DOWN:
        this.decreaseAimAngle();
        break;
    }

    if (input.jump && this.jumpTimer === 0 && this.canJump()) {
      const dir: number = this.sensorFixture.GetUserData().direction;
      this.body.ApplyLinearImpulse(new b2Vec2(this.body.GetMass() * 2 * dir, this.body.GetMass() * 5), this.body.GetWorldCenter());
      this.jumpTimer = 50;

      if (this.stopped) {
        this.body.SetSleepingAllowed(false);
        this.stopped = false;
      }
    }

    this.jumpTimerTick();
  }

  increaseAimAngle(): void {
    this.aimAngle += Player.AIM_MOVEMENT_RATE;
    this.aimAngle = b2Min(this.aimAngle, Player.AIM_MAX_ANGLE);
  }

  decreaseAimAngle(): void {
    this.aimAngle -= Player.AIM_MOVEMENT_RATE;
    this.aimAngle = b2Max(this.aimAngle, Player.AIM_MIN_ANGLE);
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
