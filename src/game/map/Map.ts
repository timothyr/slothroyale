import { b2Fixture, b2Vec2, b2AABB, b2Contact, b2Sin, b2Cos, b2DegToRad, b2ContactListener} from '@flyover/box2d';
import { MapBase, Settings } from '@game/core/MapBase';
import { Input } from '@game/core/InputTypes';
import { GenerateMap } from '@game/map/map-generation/MapGenerator';
import { generateCircularPolygon, CreateGroundPoly, DestroyGroundPoly } from '@game/map/PolygonBuilder';
import { DestroyGround, DestroyedGroundResult } from '@game/map/DestroyGround';
import { UserData } from '@game/object/UserData';
import { Player } from '@game/player/Player';
import { playerPreSolve, playerEndContact, playerBeginContact } from '@game/player/ContactListener';
import { GameObject } from '@game/object/GameObject';
import { Grenade } from '@game/weapon/Grenade';
import { projectileBeginContact } from '@game/weapon/ContactListener';
import { Point } from 'pixi.js';
import { gfx } from '@game/graphics/Pixi';

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

      // Get player position generator for map
      this.playerPositionGenerator = map.playerPositionGenerator;

      // Create all ground polygons
      map.polygons.forEach(polyShape => this.CreateMapPoly(polyShape));

      // Create player
      const playerGenPos = this.playerPositionGenerator.getSurfacePoint(0.1);
      const playerPosX = (playerGenPos[0] / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
      const playerPosY = (playerGenPos[1] / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);
      const playerPosition = new b2Vec2(playerPosX, playerPosY);
      this.player = new Player(this.world, playerPosition);

      // Generate other random players
      for (let i = 0; i < 5; i++) {
        const randPlayerGenPos = this.playerPositionGenerator.getSurfacePoint(0.1);
        const randPlayerPosX = (randPlayerGenPos[0] / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
        const randPlayerPosY = (randPlayerGenPos[1] / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);
        const randPlayerPosition = new b2Vec2(randPlayerPosX, randPlayerPosY);
        const randPlayer = new Player(this.world, randPlayerPosition);
        this.gameObjects.push(randPlayer);
      }

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
  mapPivot: Point = new Point(0, 0);
  mouseDragPos: Point = new Point(0, 0);
  draggingMap = false;

  playerPositionGenerator;
  player: Player = null;
  playerFireCooldown = false;
  gameObjects: GameObject[] = [];
  gameObjectsToDestroy: GameObject[] = [];

  public static Create(): MapBase {
    return new Map();
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
    const gameObjectPos = gameObject.getPosition();

    const x = gameObjectPos.x;
    const y = gameObjectPos.y;

    const explosionSize = 3;

    // Create square AABB to select all potentially affected ground objects
    const aabb: b2AABB = new b2AABB();
    aabb.lowerBound.Copy(new b2Vec2(x - explosionSize, y - explosionSize));
    aabb.upperBound.Copy(new b2Vec2(x + explosionSize, y + explosionSize));

    // Create polygon
    const numSides = 15;
    const polygon = generateCircularPolygon(numSides, explosionSize, x, y);

    // Get destroyed result from polygon
    const res: DestroyedGroundResult = DestroyGround(aabb, polygon, this.world);

    // Create the new ground
    res.polygonsToAdd.forEach((poly: b2Vec2[]) => CreateGroundPoly(poly, this.world));

    // Destroy the old ground
    res.fixturesToDelete.forEach((fixture: b2Fixture) => DestroyGroundPoly(fixture, this.world));
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
    CreateGroundPoly(vertices, this.world);
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

    listener.PreSolve = (contact: b2Contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      const userDataA: UserData = fixtureA.GetUserData() || null;
      const userDataB: UserData = fixtureB.GetUserData() || null;

      playerPreSolve(contact, fixtureA, fixtureB, userDataA, userDataB);
    };

    this.world.SetContactListener(listener);
  }

  // ----- Event Handlers -----

  screenToWorldPos(event): b2Vec2 {
    const x = event.data.getLocalPosition(gfx.stage).x / gfx.metersToPixel;
    const y = event.data.getLocalPosition(gfx.stage).y / gfx.metersToPixel;

    return new b2Vec2(x, -y);
  }

  // Player event handlers

  onPlayerDragStart(event: PIXI.interaction.InteractionEvent): void {
    event.stopPropagation();
    this.player.getSprite().alpha = 0.5;
    this.MouseDown(this.screenToWorldPos(event));
    this.draggingMap = false;
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

  // Map event handlers

  // Add mouse and touch handlers for map
  addMapEventHandlers(): void {
    gfx.renderer.plugins.interaction.on('mousedown', (e) => this.onMapMouseDown(e));
    gfx.renderer.plugins.interaction.on('pointerdown', (e) => this.onMapMouseDown(e));
    gfx.renderer.plugins.interaction.on('mouseup', (e) => this.onMapMouseUp(e));
    gfx.renderer.plugins.interaction.on('mousemove', (e) => this.onMapDragMove(e));
    gfx.renderer.plugins.interaction.on('touchmove', (e) => this.onMapDragMove(e));
  }

  // Touch map

  onMapMouseDown(event: PIXI.interaction.InteractionEvent): void {
    const hit = this.MouseDown(this.screenToWorldPos(event));
    if (!hit) {
      this.onMapDragStart(event);
    }
  }

  onMapMouseUp(event: PIXI.interaction.InteractionEvent): void {
    if (this.draggingMap) {
      this.onMapDragEnd();
    }
  }

  // Drag map to move

  onMapDragStart(event: PIXI.interaction.InteractionEvent): void {
    event.data.global.copyTo(this.mouseDragPos);
    this.draggingMap = true;
  }

  onMapDragEnd(): void {
    this.draggingMap = false;
  }

  onMapDragMove(event: PIXI.interaction.InteractionEvent): void {
    event.stopPropagation();
    if (this.draggingMap) {
      const nextMouseDragPos = event.data.global.clone();
      const dragX = this.mouseDragPos.x - nextMouseDragPos.x;
      const dragY = this.mouseDragPos.y - nextMouseDragPos.y;

      this.mouseDragPos = nextMouseDragPos;

      this.mapPivot.set(this.mapPivot.x + dragX, this.mapPivot.y + dragY);

      gfx.stage.pivot = this.mapPivot;
    }
  }

  public MouseDown(p: b2Vec2): boolean {
    // Pick up Dynamic bodies
    const hitFixture = super.MouseDown(p);

    // If we didn't hit a body, destroy ground
    if (!hitFixture) {
      // Put click test here
    }

    return hitFixture;
  }
}
