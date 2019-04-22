import * as box2d from '@flyover/box2d';
import { MapBase, Settings } from '@game/core/MapBase';
import { Input, MoveX } from '@game/core/Input';
import { Player, PlayerMovement, PlayerDraggingData } from '@game/player/Player';
import { b2Fixture, b2WorldManifold, b2Vec2, b2Atan2, b2AABB, b2PolygonShape, b2Contact } from '@flyover/box2d';

import { GenerateMap } from '@game/map/map-generation/MapGenerator';
import { DrawPolygon } from '@game/graphics/Draw';
import { Subscription } from 'rxjs';
import { gfx } from '@game/graphics/Pixi';
import { DestroyGround, DestroyedGroundResult } from './DestroyGround';
import { UserData, ObjectType } from '@game/object/UserData';
import { playerPreSolve, playerEndContact, playerBeginContact } from '@game/player/ContactListener';
// import * as clipperLib from 'js-angusj-clipper/web'; // es6 / typescript


export class Map extends MapBase {

  constructor() {
    super();

    this.CreateContactListener();

    GenerateMap().then((map) => {
      // Create a physics polygon for each shape
      this.mapWidthPx = map.width;
      this.mapHeightPx = map.height;

      map.polygons.forEach(polyShape => this.CreateMapPoly(polyShape));

      this.player = new Player(this.m_world);
      this.player.setPosition(0, this.mapHeightPx / this.mapSizeMultiplier);
      // this.player.getClickEventEmitter().subscribe((playerDraggingData: PlayerDraggingData) => {
      //   this.MouseDown(pos);
      // })

      this.player.getSprite()
        // events for drag start
        .on('mousedown', (event) => this.onDragStart(event))
        .on('touchstart', (event) => this.onDragStart(event))
        // events for drag end
        .on('mouseup', (event) => this.onDragEnd(event))
        .on('mouseupoutside', (event) => this.onDragEnd(event))
        .on('touchend', (event) => this.onDragEnd(event))
        .on('touchendoutside', (event) => this.onDragEnd(event))
        // events for drag move
        .on('mousemove', (event) => this.onDragMove(event))
        .on('touchmove', (event) => this.onDragMove(event));
    });
  }

  public metersToPixel = 20;

  mapSizeMultiplier = 8;
  mapWidthPx = 1280;
  mapHeightPx = 612;
  mapClipper: any;

  player: Player = null;
  playerClickListener: Subscription;

  public static Create(): MapBase {
    return new Map();
  }


  onDragStart(event): void {
    this.player.getSprite().alpha = 0.5;
    this.MouseDown(this.screenToWorldPos(event));
  }

  onDragEnd(event): void {
    this.player.getSprite().alpha = 1;
    this.MouseUp(this.screenToWorldPos(event));
  }

  onDragMove(event): void {
    this.MouseMove(this.screenToWorldPos(event));
  }

  screenToWorldPos(event): b2Vec2 {
    const x = (event.data.global.x - gfx.stage.position.x) / gfx.metersToPixel;
    const y = (event.data.global.y - gfx.stage.position.y) / gfx.metersToPixel;
    return new b2Vec2(x, -y);
  }

  private CreateMapPoly(polygon: b2Vec2[]): void {
    const vertices: box2d.b2Vec2[] = polygon.map(v => {
      // Center the polygons on the map
      const x = (v.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
      const y = (v.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);

      return new box2d.b2Vec2(x, y);
    });

    this.CreatePoly(vertices);
  }

  public CreatePoly(polygon: b2Vec2[]): void {

    const pixiVertices: number[] = [];

    polygon.forEach((v: b2Vec2) => {
      pixiVertices.push(v.x * this.metersToPixel);
      pixiVertices.push(-v.y * this.metersToPixel);
    });

    // pixi

    DrawPolygon(pixiVertices);

    // box2d

    const bd = new box2d.b2BodyDef();
    const ground = this.m_world.CreateBody(bd);

    // Polygon
    {
      const shape = new box2d.b2PolygonShape();

      shape.Set(polygon, polygon.length);
      ground.CreateFixture(shape, 0.0);
    }
  }



  public Step(settings: Settings, input: Input): void {

    if (this.player) {
      this.player.handleInput(input);
      this.player.updateSprite();
    }

    super.Step(settings, input);
  }

  public MouseDown(p: box2d.b2Vec2): boolean {
    const hit_fixture = super.MouseDown(p);

    // if we didnt hit a fixture, create a circle
    if (!hit_fixture) {
      // const bd = new box2d.b2BodyDef();
      // bd.type = box2d.b2BodyType.b2_staticBody;
      // bd.position.Copy(p);
      // const body = this.m_world.CreateBody(bd);
      // const shape = new box2d.b2CircleShape();
      // // shape.m_p.Set(0, 10);
      // // shape.
      // shape.m_radius = 4;
      // const f = body.CreateFixture(shape, 0.5);


      // this.QueryAABB(null, aabb, (fixture: b2Fixture): boolean => { out.push(fixture); return true; });

      const aabb: b2AABB = new b2AABB();
      aabb.lowerBound.Copy(new b2Vec2(p.x - 1, p.y - 1));
      aabb.upperBound.Copy(new b2Vec2(p.x + 1, p.y + 1));

      const poly1: any[] = [{ x: p.x - 1, y: p.y - 1 }, { x: p.x - 1, y: p.y + 1 }, { x: p.x + 1, y: p.y + 1 }, { x: p.x + 1, y: p.y - 1 }];

      const res: DestroyedGroundResult = DestroyGround(aabb, poly1, this.m_world);

      // Create the new ground
      res.polygonsToAdd.forEach((poly: b2Vec2[]) => this.CreatePoly(poly));

      // Destroy the old ground
      res.fixturesToDelete.forEach((fixture: b2Fixture) => this.m_world.DestroyBody(fixture.GetBody()));
    }


    return hit_fixture;
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

  // --------- Collision -------------

  public CreateContactListener(): void {
    const listener = new box2d.b2ContactListener();
    listener.BeginContact = (contact: b2Contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const userDataA: UserData = fixtureA.GetUserData() || null;
      const userDataB: UserData = fixtureB.GetUserData() || null;

      const playerContactChange = playerBeginContact(contact, fixtureA, fixtureB, userDataA, userDataB);
      this.player.addNumFootContacts(playerContactChange);
    };

    listener.EndContact = (contact: b2Contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const userDataA: UserData = fixtureA.GetUserData() || null;
      const userDataB: UserData = fixtureB.GetUserData() || null;

      const playerContactChange = playerEndContact(contact, fixtureA, fixtureB, userDataA, userDataB);
      this.player.addNumFootContacts(playerContactChange);
    };

    // listener.PostSolve = function(contact, impulse) {
    // }

    listener.PreSolve = (contact: b2Contact, oldManifold) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const userDataA: UserData = fixtureA.GetUserData() || null;
      const userDataB: UserData = fixtureB.GetUserData() || null;

      playerPreSolve(contact, fixtureA, fixtureB, userDataA, userDataB);
    };

    this.m_world.SetContactListener(listener);
  }
}
