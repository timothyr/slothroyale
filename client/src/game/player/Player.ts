import { Input, MoveX, MoveY } from '@game/core/InputTypes';
import * as PIXI from 'pixi.js';
import {
  b2Vec2, b2Body, b2World, b2Sin, b2Cos, b2DegToRad, b2Max, b2Min, b2Fixture,
  b2BodyType, b2BodyDef, b2PolygonShape, b2CircleShape, b2FixtureDef
} from '@flyover/box2d';
import { UserData, ObjectType } from '@game/object/UserData';
import { GameObject } from '@game/object/GameObject';

const PLAYER_MIN_ANGLE = -90 - 82; // - 70;
const PLAYER_MAX_ANGLE = -90 + 82; // + 70;

const AIM_MIN_ANGLE = 0;
const AIM_MAX_ANGLE = 180;

export const enum PlayerDirection {
  LEFT = -1,
  RIGHT = 1
}

export interface PlayerMovement extends UserData {
  minAngle: number;
  maxAngle: number;
  velocity: number;
  moveX: MoveX;
  direction: PlayerDirection;
  numFootContacts: number;
}

export class Player extends GameObject {

  sensorFixture: b2Fixture;
  playerMovement: PlayerMovement;
  jumpTimer: number;
  stopped = true;
  sprite: PIXI.Sprite;
  aimArrow: PIXI.DisplayObject;
  aimAngle = 90;
  direction = PlayerDirection.RIGHT;

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
      displayObject: this.displayObject,
      minAngle: b2DegToRad(PLAYER_MIN_ANGLE),
      maxAngle: b2DegToRad(PLAYER_MAX_ANGLE),
      velocity: 0,
      moveX: MoveX.NONE,
      direction: PlayerDirection.RIGHT,
      numFootContacts: 0,
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

  createSprite(): PIXI.Sprite {
    // test player sprite
    const sprite = PIXI.Sprite.from('assets/bunny.png');
    sprite.anchor.set(0.5, 0.3);
    sprite.interactive = true;
    sprite.buttonMode = true;
    this.sprite = sprite;

    this.DrawAimArrow();

    return sprite;
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

      switch (input.moveX) {
        case MoveX.LEFT:
          this.direction = direction = PlayerDirection.LEFT;
          velocity = -2;
          break;
        case MoveX.RIGHT:
          this.direction = direction = PlayerDirection.RIGHT;
          velocity = 2;
          break;
      }

      this.sensorFixture.SetUserData({
        ...this.sensorFixture.GetUserData(),
        velocity,
        moveX: input.moveX,
        ...(direction) && { direction }
      });
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

    // Update Aim arrow

    switch (input.moveY) {
      case MoveY.UP:
        this.aimAngle += 2;
        this.aimAngle = b2Min(this.aimAngle, AIM_MAX_ANGLE);
        break;
      case MoveY.DOWN:
        this.aimAngle -= 2;
        this.aimAngle = b2Max(this.aimAngle, AIM_MIN_ANGLE);
        break;
    }

    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(this.aimAngle * this.direction * -1));
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

  // Aiming arrow

  DrawAimArrow() {
    const graphics = new PIXI.Graphics();

    const angle = 0;
    const radius = 30;

    const s = radius * b2Sin(b2DegToRad(angle + 10));
    const c = radius * b2Cos(b2DegToRad(angle + 10));
    const s1 = radius * b2Sin(b2DegToRad(angle - 10));
    const c1 = radius * b2Cos(b2DegToRad(angle - 10));
    const s2 = radius * b2Sin(b2DegToRad(angle)) * 2;
    const c2 = radius * b2Cos(b2DegToRad(angle)) * 2;

    const vertices: number[] = [s, c, s1, c1, s2, c2];

    graphics.lineStyle(0);
    graphics.beginFill(0xFAFAFA, 1);
    graphics.drawPolygon(vertices);
    graphics.endFill();

    this.aimArrow = this.sprite.addChild(graphics);

    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(270));
  }

  RemoveAimArrow(): void {
    this.sprite.removeChild(this.aimArrow);
  }
}
