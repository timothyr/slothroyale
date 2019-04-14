import * as box2d from '@flyover/box2d';
import { MapBase, Settings } from '@game/core/MapBase';
import { Input, MoveX } from '@game/core/Input';
import { Player, PlayerMovement } from '@game/player/Player';
import { b2Fixture, b2WorldManifold, b2Vec2, b2Atan2, b2RadToDeg } from '@flyover/box2d';

import { g_debugDraw } from '@game/core/DebugDraw';
import { GenerateMap } from '@game/map/map-generation/MapGenerator';

export class Map extends MapBase {

  public CreatePoly(hullArray, avgX, avgY): void {

    console.log('hull pts', typeof(hullArray), hullArray)
    

    // if (hullArray.length > 30) {
    //   return
    // }

    const vertices: box2d.b2Vec2[] = hullArray.map(v => {
      return new box2d.b2Vec2(
        (v.x / 5) - (avgX / 5), 
        (v.y / -5) - (avgY / -5)
        
        );
    });

    const bd = new box2d.b2BodyDef();
    const ground = this.m_world.CreateBody(bd);

    // Polygon
    {
      const shape = new box2d.b2PolygonShape();

      shape.Set(vertices, vertices.length);
      ground.CreateFixture(shape, 0.0);
    }
  }

  constructor() {
    super();

    this.CreateContactListener();

    // this.CreateWalls();
    // this.CreateRamp();

    GenerateMap().then((map) => {



      map.polygons.forEach(polyShape => {
          
            console.log("poly length", polyShape.length)
            // for pts
            this.CreatePoly(polyShape, 1280 / 2, 612 / 2);

      })


      this.player = new Player(this.m_world);

      this.player.setPosition(0, 612)

    });
    
    // this.CreateCircles(2);

    
  }

  player: Player;

  public static Create(): MapBase {
    return new Map();
  }

  public CreateContactListener(): void {
    const listener = new box2d.b2ContactListener();
    listener.BeginContact = (contact) => {
        const fixtureA: b2Fixture = contact.GetFixtureA();
        const fixtureB: b2Fixture = contact.GetFixtureB();

        const playerMovementA: PlayerMovement = fixtureA.GetUserData() || null;
        const playerMovementB: PlayerMovement = fixtureB.GetUserData() || null;

        if (playerMovementA) {
          this.player.addNumFootContacts(1);
        }

        if (playerMovementB) {
          this.player.addNumFootContacts(1);
        }
    };

    listener.EndContact = (contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const playerMovementA: PlayerMovement = fixtureA.GetUserData() || null;
      const playerMovementB: PlayerMovement = fixtureB.GetUserData() || null;

      if (playerMovementA) {
        this.player.addNumFootContacts(-1);
      }

      if (playerMovementB) {
        this.player.addNumFootContacts(-1);
      }
    };
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

      const getForce = (playerMovement: PlayerMovement, localNormal: b2Vec2) => {
        const angle = b2Atan2(localNormal.y, localNormal.x);
        // Only move if the hill isn't too steep
        if (playerMovement.minAngle < angle && angle < playerMovement.maxAngle
          // Let the player move down any hill
          || playerMovement.moveX === MoveX.RIGHT && playerMovement.minAngle > angle
          || playerMovement.moveX === MoveX.LEFT &&  angle > playerMovement.maxAngle) {
          // Add velocity
          surfaceVelocityModifier += playerMovement.velocity;
        }
      };

      if (playerMovementA) {
        const localNormal = fixtureA.GetBody().GetLocalVector(worldManifold.normal, new b2Vec2());
        getForce(playerMovementA, localNormal);
      }

      if (playerMovementB) {
        const negWorldNormal = new b2Vec2(-worldManifold.normal.x, -worldManifold.normal.y);
        const localNormal = fixtureB.GetBody().GetLocalVector(negWorldNormal, new b2Vec2());
        getForce(playerMovementB, localNormal);
      }

      contact.SetTangentSpeed(surfaceVelocityModifier);
    };

    this.m_world.SetContactListener(listener);
  }

  public Step(settings: Settings, input: Input): void {

    if(this.player) {
      this.player.handleInput(input);

      g_debugDraw.DrawString(500, 500, `jump? ${this.player.canJump()}`);
    }
    

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
