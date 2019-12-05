import { b2Fixture, b2Vec2, b2AABB, b2Contact, b2Sin, b2Cos, b2DegToRad, b2ContactListener } from '@flyover/box2d';
import { MapBase, Settings } from '../core/MapBase';
import { Input } from '../core/InputTypes';
import { generateCircularPolygon } from './PolygonBuilder';
import { DestroyGround, DestroyedGroundResult } from './DestroyGround';
import { UserData, ObjectType } from '../object/UserData';
import { Player } from '../player/Player';
import { playerPreSolve, playerEndContact, playerBeginContact } from '../player/ContactListener';
import { GameObject } from '../object/GameObject';
import { projectileBeginContact } from '../weapon/ContactListener';
import { GameObjectFactory } from '../object/GameObjectFactory';
import { Ground } from '../object/Ground';

export interface MapOptions {
  width: number;
  height: number;
  polygons: b2Vec2[][];
  playerPositions: b2Vec2[];
}

export class Map extends MapBase {

  constructor(mapOptions: MapOptions, gameObjectFactory: GameObjectFactory) {
    super();

    this.gameObjectFactory = gameObjectFactory;
    this.initMap(mapOptions);
  }

  mapSizeMultiplier = 8;
  mapWidthPx = 1280;
  mapHeightPx = 612;
  mapClipper: any;

  player: Player = null;
  playerFireCooldown = false;
  gameObjectFactory: GameObjectFactory;
  gameObjects: GameObject[] = [];
  gameObjectsToDestroy: GameObject[] = [];
  ground: Ground[] = []

  public static Create(mapOptions: MapOptions, gameObjectFactory: GameObjectFactory): Map {
    return new Map(mapOptions, gameObjectFactory);
  }

  public initMap(map: MapOptions): void {
    // Create a physics polygon for each shape
    this.mapWidthPx = map.width;
    this.mapHeightPx = map.height;

    // Create all ground polygons
    map.polygons.forEach(polyShape => this.CreateMapPoly(polyShape));

    // Create player
    const playerGenPos = map.playerPositions[0];
    const playerPosX = (playerGenPos.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
    const playerPosY = (playerGenPos.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);
    const playerPosition = new b2Vec2(playerPosX, playerPosY);
    this.player = this.gameObjectFactory.createPlayer(this.world, playerPosition);

    // Generate other random players
    for (let i = 1; i < 5; i++) {
      const randPlayerGenPos = map.playerPositions[i];
      const randPlayerPosX = (randPlayerGenPos.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
      const randPlayerPosY = (randPlayerGenPos.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);
      const randPlayerPosition = new b2Vec2(randPlayerPosX, randPlayerPosY);
      const randPlayer = this.gameObjectFactory.createPlayer(this.world, randPlayerPosition);
      this.gameObjects.push(randPlayer);
    }

    // Create contact listener for the world
    this.CreateContactListener();
  }

  /**
   * Step is called every frame, 60 frames per second
   * @param settings Deprecated
   * @param input Input from Main
   */
  public Step(settings: Settings, input: Input): void {

    if (this.player) {
      this.player.handleInput(input);
      this.player.update();

      if (this.playerFireCooldown && !input.fire) {
        this.playerFireCooldown = false;
      }

      if (input.fire && !this.playerFireCooldown) {
        const playerPosition = this.player.getPosition();

        const gx = playerPosition.x + (2 * b2Sin(b2DegToRad(this.player.aimAngle)) * this.player.direction);
        const gy = playerPosition.y - (2 * b2Cos(b2DegToRad(this.player.aimAngle)));
        const grenadePosition = new b2Vec2(gx, gy);

        const grenade = this.gameObjectFactory.createGrenade(this.world, grenadePosition, this.player.aimAngle, this.player.direction);
        this.gameObjects.push(grenade);

        this.playerFireCooldown = true;
      }
    }

    this.gameObjects.forEach(gameObject => gameObject.update());

    // Destroy all objects in destruction queue
    this.gameObjectsToDestroy.forEach(gameObject => {

      // Explode
      this.projectileExplode(gameObject);

      gameObject.destroy();

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

  private projectileExplode(gameObject: GameObject): void {
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
    const res: DestroyedGroundResult = DestroyGround(aabb, polygon, this.world, this.mapClipper);

    // Create the new ground
    res.polygonsToAdd.forEach((polygon: b2Vec2[]) => 
    {
      // CreateGroundPoly(poly, this.world)
      const ground = this.gameObjectFactory.createGround(this.world, null, {polygon})
      this.ground.push(ground);
    });

    // Destroy the old ground
    res.fixturesToDelete.forEach((fixture: b2Fixture) => this.RemoveGroundPoly(fixture));
  }

  getGroundByLocalUUID(localUUID: number): Ground {
    return this.ground.find((ground) => ground.getLocalUUID() === localUUID);
  }

  /**
   * Creates ground polygons that are sized based on map size multiplier
   * @param polygon Ground polygon to create
   */
  private CreateMapPoly(vertices: b2Vec2[]): void {
    const polygon: b2Vec2[] = vertices.map(v => {
      // Center the polygons on the map
      const x = (v.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
      const y = (v.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);

      return new b2Vec2(x, y);
    });

    // Create the ground
    // CreateGroundPoly(vertices, this.world);
    const ground = this.gameObjectFactory.createGround(this.world, null, {polygon})
    this.ground.push(ground);
  }

  /**
   * Destroy the ground object by deleting the polygon and removing sprites
   * @param fixture Ground fixture
   */
  RemoveGroundPoly(fixture: b2Fixture): void {
    const userData: UserData = fixture.GetUserData();

    // Ensure that object is ground
    if (userData.objectType !== ObjectType.GROUND) {
      return;
    }

    const localUUID = userData.localUUID;
    const ground = this.getGroundByLocalUUID(localUUID);

    if (ground) {
      ground.destroy();
    }
    else {
      console.log("Error attempting to destroy ground with localUUID" + localUUID);
    }
  }

  // --------- Collision -------------

  private CreateContactListener(): void {
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

  public MouseDown(p: b2Vec2): boolean {
    return super.MouseDown(p);
  }

  public setMapClipper(mapClipper: any): void {
    this.mapClipper = mapClipper;
  }
}
