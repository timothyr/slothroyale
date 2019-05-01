import * as box2d from '@flyover/box2d';
import { Input, MoveX } from '@game/core/Input';
import { gfx } from '@game/graphics/Pixi';
import * as PIXI from 'pixi.js';
import { EventEmitter } from '@angular/core';
import { b2Vec2 } from '@flyover/box2d';
import { Observable } from 'rxjs';
import { UserData, ObjectType } from '@game/object/UserData';

const PLAYER_MIN_ANGLE = -90 - 82;//- 70;
const PLAYER_MAX_ANGLE = -90 + 82;//+ 70;

export interface PlayerDraggingData {
  isDragging: boolean;
  pos: b2Vec2;
}

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

export class Player {

  private clickEventEmitter: EventEmitter<PlayerDraggingData>;
  private isDragging = false;
  private playerSprite: PIXI.Sprite;
  body: box2d.b2Body;
  sensorFixture: box2d.b2Fixture;
  playerMovement: PlayerMovement;
  jumpTimer: number;
  stopped = true;

  constructor(m_world: box2d.b2World) {
    const bd = new box2d.b2BodyDef();
    bd.type = box2d.b2BodyType.b2_dynamicBody;

    // Player graphics
    const displayObject = this.createSprite();

    this.body = m_world.CreateBody(bd);

    const box = new box2d.b2PolygonShape();
    box.SetAsBox(0.5, 0.75);
    const playerPhysicsFixture = this.body.CreateFixture(box, 0);

    const circle = new box2d.b2CircleShape();
    circle.m_p.Set(0, -0.75);
    circle.m_radius = 0.5;

    this.playerMovement = {
      objectType: ObjectType.PLAYER,
      displayObject,
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

    this.body.SetFixedRotation(true);
    this.body.SetSleepingAllowed(true); // set only on players turn?

    this.clickEventEmitter = new EventEmitter<PlayerDraggingData>();
  }

  getClickEventEmitter(): Observable<PlayerDraggingData> {
    return this.clickEventEmitter.asObservable();
  }

  getSprite(): PIXI.Sprite {
    return this.playerSprite;
  }

  createSprite(): PIXI.DisplayObject {
    // test player sprite
    this.playerSprite = PIXI.Sprite.from('assets/bunny.png');
    const x = gfx.screen.width/2;
    const y = gfx.screen.height/2;
    console.log("seyt bunny to ",x ,y)
    this.playerSprite.position.set(x, y);
    this.playerSprite.anchor.set(0.5);
    this.playerSprite.interactive = true;
    this.playerSprite.buttonMode = true;

    return gfx.stage.addChild(this.playerSprite);
  }

  updateSprite(): void {
    const worldCenter = this.body.GetWorldCenter()
    this.playerSprite.position.set(worldCenter.x * gfx.metersToPixel, -worldCenter.y * gfx.metersToPixel);
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
      const debug_pos = this.body.GetPosition();
      console.log("body pos",debug_pos.x, debug_pos.y);
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

  setPosition(x, y): void {
    this.body.SetPosition(new box2d.b2Vec2(x,y));
  }
}
