import * as box2d from '@flyover/box2d';
import { MapBase, Settings } from '@game/core/MapBase';
import { Input, MoveX } from '@game/core/Input';
import { Player, PlayerMovement } from '@game/player/Player';
import { b2Fixture, b2WorldManifold, b2Vec2, b2Atan2, b2RadToDeg } from '@flyover/box2d';

export class Map extends MapBase {

  constructor() {
    super();

    this.CreateContactListener();

    this.CreateWalls();
    this.CreateRamp();
    // this.CreateCircles(2);

    this.player = new Player(this.m_world);
  }

  player: Player;

  public static Create(): MapBase {
    return new Map();
  }

  public CreateContactListener(): void {
    const listener = new box2d.b2ContactListener();
    // listener.BeginContact = (contact) => {
    //     // console.log(contact.GetFixtureA().GetBody().GetUserData());
    //     console.log(contact)
    // }
    // listener.EndContact = function(contact) {
    //     // console.log(contact.GetFixtureA().GetBody().GetUserData());
    // }
    // listener.PostSolve = function(contact, impulse) {
    // }

    listener.PreSolve = (contact, oldManifold) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const playerMovementA: PlayerMovement = fixtureA.GetUserData() || null;
      const playerMovementB: PlayerMovement = fixtureB.GetUserData() || null;

      const worldManifold: b2WorldManifold = new b2WorldManifold();
      contact.GetWorldManifold(worldManifold);

      let surfaceVelocityModifier = 0;

      if (playerMovementA) {
        const localNormal = fixtureA.GetBody().GetLocalVector(worldManifold.normal, new b2Vec2());
        const angle = b2Atan2(localNormal.y, localNormal.x);
        // Only move if the hill isn't too steep
        if (playerMovementA.minAngle < angle && angle < playerMovementA.maxAngle
          // Let the player move down any hill
          || playerMovementA.moveX === MoveX.RIGHT && playerMovementA.minAngle > angle
          || playerMovementA.moveX === MoveX.LEFT &&  angle > playerMovementA.maxAngle) {
          surfaceVelocityModifier += playerMovementA.velocity;
        }
      }

      if (playerMovementB) {
        const negWorldNormal = new b2Vec2(-worldManifold.normal.x, -worldManifold.normal.y);
        const localNormal = fixtureB.GetBody().GetLocalVector(negWorldNormal, new b2Vec2());
        const angle = b2Atan2(localNormal.y, localNormal.x);
        // Only move if the hill isn't too steep
        if (playerMovementB.minAngle < angle && angle < playerMovementB.maxAngle
          // Let the player move down any hill
          || playerMovementB.moveX === MoveX.RIGHT && playerMovementB.minAngle > angle
          || playerMovementB.moveX === MoveX.LEFT &&  angle > playerMovementB.maxAngle) {
          surfaceVelocityModifier += playerMovementB.velocity;
        }
      }

      contact.SetTangentSpeed(surfaceVelocityModifier);
    }

    this.m_world.SetContactListener(listener);
  }

  public Step(settings: Settings, input: Input): void {

    this.player.handleInput(input);

    super.Step(settings, input);
  }

  public CreateCircles(numCircles: number): void {
    // Create circles
    for (let i = 0; i < numCircles; i++) {
      const bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      const body = this.m_world.CreateBody(bd);
      const shape = new box2d.b2CircleShape();
      shape.m_p.Set(0, 10 * (i + 1));
      shape.m_radius = 4;
      const f = body.CreateFixture(shape, 0.5);
    }
  }

  public CreateRamp(): void {
    {
      const bd = new box2d.b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      // Right slope
      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(15, 5),
          new box2d.b2Vec2(10, 10),
          new box2d.b2Vec2(20, 0),
          new box2d.b2Vec2(5, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      // Left slope
      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-15, 5),
          new box2d.b2Vec2(-7, 5),
          new box2d.b2Vec2(-20, 0),
          new box2d.b2Vec2(-2, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }

  public CreateWalls(): void {
    // Create the walls of the world.
    {
      const bd = new box2d.b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, -10),
          new box2d.b2Vec2(40, -10),
          new box2d.b2Vec2(40, 0),
          new box2d.b2Vec2(-40, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, 40),
          new box2d.b2Vec2(40, 40),
          new box2d.b2Vec2(40, 50),
          new box2d.b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, -10),
          new box2d.b2Vec2(-20, -10),
          new box2d.b2Vec2(-20, 50),
          new box2d.b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(20, -10),
          new box2d.b2Vec2(40, -10),
          new box2d.b2Vec2(40, 50),
          new box2d.b2Vec2(20, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }
}
