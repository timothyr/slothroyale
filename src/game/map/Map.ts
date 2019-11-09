import { MapBase, Settings } from '@game/core/MapBase';
import { Input } from '@game/core/InputTypes';
import { Player } from '@game/player/Player';
import {
  b2Fixture, b2Vec2, b2AABB, b2Contact, b2Sin, b2Cos, b2DegToRad, b2BodyDef,
  b2PolygonShape, b2FixtureDef, b2BodyType, b2CircleShape, b2ContactListener
} from '@flyover/box2d';
import { GenerateMap } from '@game/map/map-generation/MapGenerator';
import { DrawPolygon, RemovePolygon } from '@game/graphics/Draw';
import { gfx, metersToPixel } from '@game/graphics/Pixi';
import { DestroyGround, DestroyedGroundResult } from './DestroyGround';
import { UserData, ObjectType } from '@game/object/UserData';
import { playerPreSolve, playerEndContact, playerBeginContact } from '@game/player/ContactListener';
import { GameObject } from '@game/object/GameObject';
import { Grenade } from '@game/weapon/Grenade';
import { projectileBeginContact } from '@game/weapon/ContactListener';

export class Map extends MapBase {

  constructor() {
    super();

    // Create contact listener for the world
    this.CreateContactListener();

    // Generate the map
    GenerateMap().then((map) => {
      // Create a physics polygon for each shape
      this.mapWidthPx = map.width;
      this.mapHeightPx = map.height;

      // Create all ground polygons
      map.polygons.forEach(polyShape => this.CreateMapPoly(polyShape));

      // Create player
      const playerPosition = new b2Vec2(0, this.mapHeightPx / this.mapSizeMultiplier);
      this.player = new Player(this.world, playerPosition);

      // Set eventhandlers for map
      this.addMapEventHandlers();

      // Set eventhandlers for player
      this.player.getSprite()
        // events for drag start
        .on('mousedown', (event) => this.onPlayerDragStart(event))
        .on('touchstart', (event) => this.onPlayerDragStart(event))
        // events for drag end
        .on('mouseup', (event) => this.onPlayerDragEnd(event))
        .on('mouseupoutside', (event) => this.onPlayerDragEnd(event))
        .on('touchend', (event) => this.onPlayerDragEnd(event))
        .on('touchendoutside', (event) => this.onPlayerDragEnd(event))
        // events for drag move
        .on('mousemove', (event) => this.onPlayerDragMove(event))
        .on('touchmove', (event) => this.onPlayerDragMove(event));
    });
  }


  mapSizeMultiplier = 8;
  mapWidthPx = 1280;
  mapHeightPx = 612;
  mapClipper: any;

  player: Player = null;
  playerFireCooldown = false;
  gameObjects: GameObject[] = [];
  gameObjectsToDestroy: GameObject[] = [];


  public static Create(): MapBase {
    return new Map();
  }

  // Add mouse and touch handlers for map
  addMapEventHandlers(): void {
    gfx.renderer.plugins.interaction.on('mousedown', (e) => this.onMapMouseDown(e));
    gfx.renderer.plugins.interaction.on('pointerdown', (e) => this.onMapMouseDown(e));
    gfx.renderer.plugins.interaction.on('mouseup', (e) => this.onMapMouseUp(e));
  }

  onMapMouseDown(event: PIXI.interaction.InteractionEvent): void {
    this.MouseDown(this.screenToWorldPos(event));
  }

  onMapMouseUp(event: PIXI.interaction.InteractionEvent): void {
    this.MouseUp(this.screenToWorldPos(event));
  }

  onPlayerDragStart(event: PIXI.interaction.InteractionEvent): void {
    event.stopPropagation();
    this.player.getSprite().alpha = 0.5;
    this.MouseDown(this.screenToWorldPos(event));
  }

  onPlayerDragEnd(event: PIXI.interaction.InteractionEvent): void {
    event.stopPropagation();
    this.player.getSprite().alpha = 1;
    this.MouseUp(this.screenToWorldPos(event));
  }

  onPlayerDragMove(event: PIXI.interaction.InteractionEvent): void {
    event.stopPropagation();
    this.MouseMove(this.screenToWorldPos(event));
  }

  screenToWorldPos(event): b2Vec2 {
    const x = (event.data.global.x - gfx.stage.position.x) / gfx.metersToPixel;
    const y = (event.data.global.y - gfx.stage.position.y) / gfx.metersToPixel;
    return new b2Vec2(x, -y);
  }

  /**
   * Creates ground polygons that are sized based on map size multiplier
   * @param polygon Ground polygon to create
   */
  private CreateMapPoly(polygon: b2Vec2[]): void {
    const vertices: b2Vec2[] = polygon.map(v => {
      // Center the polygons on the map
      const x = (v.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
      const y = (v.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);

      return new b2Vec2(x, y);
    });

    // Create the ground
    this.CreateGroundPoly(vertices);
  }

  /**
   * Creates ground polygons for the map
   * @param polygon Ground polygon to create
   */
  public CreateGroundPoly(polygon: b2Vec2[]): void {

    // Pixi Graphics

    const pixiVertices: number[] = [];

    polygon.forEach((v: b2Vec2) => {
      pixiVertices.push(v.x * metersToPixel);
      pixiVertices.push(-v.y * metersToPixel);
    });

    const displayObject = DrawPolygon(pixiVertices);

    // Box2D Physics

    const bd = new b2BodyDef();
    const ground = this.world.CreateBody(bd);

    // Set shape
    const shape = new b2PolygonShape();
    shape.Set(polygon, polygon.length);

    // Set UserData to ground
    const groundUserData: UserData = {
      objectType: ObjectType.GROUND,
      displayObject,
    };

    // Create ground fixture
    const groundFixtureDef = new b2FixtureDef();
    groundFixtureDef.shape = shape;
    groundFixtureDef.userData = groundUserData;
    ground.CreateFixture(groundFixtureDef, 0);
  }

  /**
   * Destroy the ground object by deleting the polygon and removing sprites
   * @param fixture Ground fixture
   */
  DestroyGroundPoly(fixture: b2Fixture): void {
    const userData: UserData = fixture.GetUserData();

    // Ensure that object is ground
    if (userData.objectType !== ObjectType.GROUND) {
      return;
    }

    // Remove physics object
    this.world.DestroyBody(fixture.GetBody());

    // Remove Pixi sprite from stage
    if (userData.displayObject) {
      RemovePolygon(userData.displayObject);
    }
  }

  /**
   * Step is called every frame, 60 frames per second
   * @param settings Deprecated
   * @param input Input from Main
   */
  public Step(settings: Settings, input: Input): void {

    if (this.player) {
      this.player.handleInput(input);
      this.player.updateSprite();

      if (this.playerFireCooldown && !input.fire) {
        this.playerFireCooldown = false;
      }

      if (input.fire && !this.playerFireCooldown) {
        const playerPosition = this.player.getPosition();

        const gx = playerPosition.x + (2 * b2Sin(b2DegToRad(this.player.aimAngle)) * this.player.direction);
        const gy = playerPosition.y - (2 * b2Cos(b2DegToRad(this.player.aimAngle)));
        const grenadePosition = new b2Vec2(gx, gy);

        const grenade = new Grenade(this.world, grenadePosition, this.player.aimAngle, this.player.direction);

        this.gameObjects.push(grenade);

        this.playerFireCooldown = true;
      }
    }

    this.gameObjects.forEach(gameObject => gameObject.updateSprite());

    // Destroy all objects in destruction queue
    this.gameObjectsToDestroy.forEach(gameObject => {

      // Explode
      this.projectileExplode(gameObject);

      gameObject.destroyBody();
      gameObject.destroySprite();

      const index = this.gameObjects.indexOf(gameObject, 0);
      if (index > -1) {
        this.gameObjects.splice(index, 1);
      }

    });

    // Clear destroy array
    this.gameObjectsToDestroy.length = 0;

    // Step
    super.Step(settings, input);
  }

  projectileExplode(gameObject: GameObject): void {

    const x = gameObject.getPosition().x;
    const y = gameObject.getPosition().y;

    // Testing: Destroy 2x2 block of ground on mouse press
    const aabb: b2AABB = new b2AABB();
    aabb.lowerBound.Copy(new b2Vec2(x - 1, y - 1));
    aabb.upperBound.Copy(new b2Vec2(x + 1, y + 1));

    const poly1: any[] = [{ x: x - 1, y: y - 1 }, { x: x - 1, y: y + 1 }, { x: x + 1, y: y + 1 }, { x: x + 1, y: y - 1 }];

    const res: DestroyedGroundResult = DestroyGround(aabb, poly1, this.world);

    // Create the new ground
    res.polygonsToAdd.forEach((poly: b2Vec2[]) => this.CreateGroundPoly(poly));

    // Destroy the old ground
    res.fixturesToDelete.forEach((fixture: b2Fixture) => this.DestroyGroundPoly(fixture));
  }

  public MouseDown(p: b2Vec2): boolean {
    // Pick up Dynamic bodies
    const hitFixture = super.MouseDown(p);

    // If we didn't hit a body, destroy ground
    if (!hitFixture) {

      // Testing: Destroy 2x2 block of ground on mouse press
      const aabb: b2AABB = new b2AABB();
      aabb.lowerBound.Copy(new b2Vec2(p.x - 1, p.y - 1));
      aabb.upperBound.Copy(new b2Vec2(p.x + 1, p.y + 1));

      const poly1: any[] = [{ x: p.x - 1, y: p.y - 1 }, { x: p.x - 1, y: p.y + 1 }, { x: p.x + 1, y: p.y + 1 }, { x: p.x + 1, y: p.y - 1 }];

      const res: DestroyedGroundResult = DestroyGround(aabb, poly1, this.world);

      // Create the new ground
      res.polygonsToAdd.forEach((poly: b2Vec2[]) => this.CreateGroundPoly(poly));

      // Destroy the old ground
      res.fixturesToDelete.forEach((fixture: b2Fixture) => this.DestroyGroundPoly(fixture));
    }

    return hitFixture;
  }

  public CreateCircles(numCircles: number): void {
    // Create circles
    for (let i = 0; i < numCircles; i++) {
      const bd = new b2BodyDef();
      bd.type = b2BodyType.b2_dynamicBody;
      const body = this.world.CreateBody(bd);
      const shape = new b2CircleShape();
      shape.m_p.Set(0, 10 * (i + 1));
      shape.m_radius = 4;
      const f = body.CreateFixture(shape, 0.5);
    }
  }

  public CreateRamp(): void {
    {
      const bd = new b2BodyDef();
      const ground = this.world.CreateBody(bd);

      // Right slope
      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(15, 5),
          new b2Vec2(10, 10),
          new b2Vec2(20, 0),
          new b2Vec2(5, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      // Left slope
      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-15, 5),
          new b2Vec2(-7, 5),
          new b2Vec2(-20, 0),
          new b2Vec2(-2, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }

  public CreateWalls(): void {
    // Create the walls of the world.
    {
      const bd = new b2BodyDef();
      const ground = this.world.CreateBody(bd);

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-40, -10),
          new b2Vec2(40, -10),
          new b2Vec2(40, 0),
          new b2Vec2(-40, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-40, 40),
          new b2Vec2(40, 40),
          new b2Vec2(40, 50),
          new b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(-40, -10),
          new b2Vec2(-20, -10),
          new b2Vec2(-20, 50),
          new b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new b2PolygonShape();
        const vertices = [
          new b2Vec2(20, -10),
          new b2Vec2(40, -10),
          new b2Vec2(40, 50),
          new b2Vec2(20, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }

  // --------- Collision -------------

  public CreateContactListener(): void {
    const listener = new b2ContactListener();
    listener.BeginContact = (contact: b2Contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const userDataA: UserData = fixtureA.GetUserData() || null;
      const userDataB: UserData = fixtureB.GetUserData() || null;

      // Destroy projectile on hit
      const destroyUserDataList: UserData[] = projectileBeginContact(contact, fixtureA, fixtureB, userDataA, userDataB);
      if (destroyUserDataList) {
        destroyUserDataList.forEach(destroyUserData => {
          // Find matching GameObject from UserData
          const gameObjectToDestroy = this.gameObjects.find(g => g.getUserData() === destroyUserData);
          // Check for duplicates
          if (this.gameObjectsToDestroy.indexOf(gameObjectToDestroy) === -1) {
            // Add to destroy queue
            this.gameObjectsToDestroy.push(gameObjectToDestroy);
          }
        });
      }

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

    this.world.SetContactListener(listener);
  }
}
