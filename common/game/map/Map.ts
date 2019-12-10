import { b2Fixture, b2Vec2, b2AABB, b2Contact, b2Sin, b2Cos, b2DegToRad, b2ContactListener } from '@flyover/box2d';
import { MapBase, Settings } from '../core/MapBase';
import { Input } from '../core/InputTypes';
import { generateCircularPolygon } from './PolygonBuilder';
import { DestroyGround, DestroyedGroundResult } from './DestroyGround';
import { UserData, ObjectType } from '../object/UserData';
import { Player, PlayerMovement } from '../player/Player';
import { playerPreSolve } from '../player/ContactListener';
import { GameObject } from '../object/GameObject';
import { projectileBeginContact } from '../weapon/ContactListener';
import { GameObjectFactory } from '../object/GameObjectFactory';

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

  playerFireCooldown = false;
  playerPositions: b2Vec2[];
  curPlayerPosition = 0;
  curPlayerLocalUUID: number = 0;
  gameObjectFactory: GameObjectFactory;
  gameObjectsToDestroy: GameObject[] = [];


  public static Create(mapOptions: MapOptions, gameObjectFactory: GameObjectFactory): Map {
    return new Map(mapOptions, gameObjectFactory);
  }

  public initMap(map: MapOptions): void {
    // Create a physics polygon for each shape
    this.mapWidthPx = map.width;
    this.mapHeightPx = map.height;

    // Create all ground polygons
    map.polygons.forEach(polyShape => this.CreateMapPoly(polyShape));

    if (map.playerPositions.length > 0) {
      this.playerPositions = map.playerPositions;

      // Generate random players
      // for (let i = 0; i < 5; i++) {
      //   const player = this.CreatePlayer();
      //   this.curPlayerLocalUUID = player.getLocalUUID();
      // }
    }

    // Create contact listener for the world
    this.CreateContactListener();
  }

  public CreatePlayer(name?: string): Player {
    const playerGenPos = this.playerPositions[this.curPlayerPosition];
    this.curPlayerPosition += 1;
    const playerPosX = (playerGenPos.x / this.mapSizeMultiplier) - ((this.mapWidthPx / 2) / this.mapSizeMultiplier);
    const playerPosY = (playerGenPos.y / -this.mapSizeMultiplier) - ((this.mapHeightPx / 2) / -this.mapSizeMultiplier);
    const playerPosition = new b2Vec2(playerPosX, playerPosY);
    const player = this.gameObjectFactory.createPlayer(this.world, playerPosition, name);

    this.players[player.getLocalUUID()] = player;

    return player;
  }

  /**
   * Step is called every frame, 60 frames per second
   * @param settings Deprecated
   * @param input Input from Main
   */
  public Step(settings: Settings, input: Input): void {
    const player = this.players[this.curPlayerLocalUUID];

    if (player) {
      player.handleInput(input);
      player.update();

      if (this.playerFireCooldown && !input.fire) {
        this.playerFireCooldown = false;
      }

      if (input.fire && !this.playerFireCooldown) {
        const playerPosition = player.getPosition();

        const gx = playerPosition.x + (2 * b2Sin(b2DegToRad(player.aimAngle)) * player.direction);
        const gy = playerPosition.y - (2 * b2Cos(b2DegToRad(player.aimAngle)));
        const grenadePosition = new b2Vec2(gx, gy);

        const grenade = this.gameObjectFactory.createGrenade(this.world, grenadePosition, player.aimAngle, player.direction);
        this.gameObjects[grenade.getLocalUUID()] = grenade;

        this.playerFireCooldown = true;
      }
    }
    
    // Update graphics of all players
    for (let id in this.players) {
      this.players[id].update();
    }

    // Update graphics of all gameobjects
    for (let id in this.gameObjects) {
      const gameObject = this.gameObjects[id];
      if (gameObject.objectType !== ObjectType.GROUND) {
        gameObject.update();
      }
    }

    // Destroy game objects in queue
    while (this.gameObjectsToDestroy.length > 0) {
      const gameObjectsToDestroyCopy = [...this.gameObjectsToDestroy];

      // Clear destroy array
      this.gameObjectsToDestroy.length = 0;
  
      // Destroy all objects in destruction queue
      gameObjectsToDestroyCopy.forEach(gameObject => {
  
        // Explode
        if (gameObject.objectType === ObjectType.PROJECTILE) {
          this.projectileExplode(gameObject);
        }
  
        gameObject.destroy();

        const id = gameObject.getLocalUUID();
        if (gameObject.objectType === ObjectType.GROUND) {
          delete this.groundObjects[id];
        }
        else {
          delete this.gameObjects[id];
        }
      });
    }

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
      this.groundObjects[ground.getLocalUUID()] = ground;
    });

    // Destroy the old ground
    res.fixturesToDelete.forEach((fixture: b2Fixture) => this.RemoveGroundPoly(fixture));
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
    this.groundObjects[ground.getLocalUUID()] = ground;
  }

  /**
   * Destroy the ground object by deleting the polygon and removing sprites
   * @param fixture Ground fixture
   */
  RemoveGroundPoly(fixture: b2Fixture): void {
    const userData: UserData = fixture.GetUserData();

    console.log("ground poly objectType", userData.objectType);

    // Ensure that object is ground
    if (userData.objectType !== ObjectType.GROUND) {
      return;
    }

    const localUUID = userData.localUUID;
    const ground = this.groundObjects[localUUID];


    if (ground) {
      if (this.gameObjectsToDestroy.indexOf(ground) === -1) {
        // Add to destroy queue
        this.gameObjectsToDestroy.push(ground);
        console.log("destroying ground", localUUID, ground);

      }
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

      if (userDataA && userDataA.objectType === ObjectType.PLAYER) {
        this.players[userDataA.localUUID].addNumFootContacts(1);
      }
    
      if (userDataB && userDataB.objectType === ObjectType.PLAYER) {
        this.players[userDataB.localUUID].addNumFootContacts(1);
      }

      // Destroy projectile on hit
      const destroyUserDataList: UserData[] = projectileBeginContact(contact, fixtureA, fixtureB, userDataA, userDataB);
      if (destroyUserDataList) {
        destroyUserDataList.forEach(destroyUserData => {
          // Find matching GameObject from UserData
          // const gameObjectToDestroy = this.gameObjects.find(g => g.getUserData() === destroyUserData);
          const id = destroyUserData.localUUID;
          const gameObjectToDestroy = this.gameObjects[id];
          // Check for duplicates
          if (this.gameObjectsToDestroy.indexOf(gameObjectToDestroy) === -1) {
            // Add to destroy queue
            this.gameObjectsToDestroy.push(gameObjectToDestroy);
          }
        });
      }
    };

    listener.EndContact = (contact: b2Contact) => {
      const fixtureA: b2Fixture = contact.GetFixtureA();
      const fixtureB: b2Fixture = contact.GetFixtureB();

      let userDataA: UserData | PlayerMovement = fixtureA.GetUserData() || null;
      let userDataB: UserData | PlayerMovement = fixtureB.GetUserData() || null;

      if (userDataA && userDataA.objectType === ObjectType.PLAYER) {
        this.players[userDataA.localUUID].addNumFootContacts(-1);
      }
    
      if (userDataB && userDataB.objectType === ObjectType.PLAYER) {
        this.players[userDataB.localUUID].addNumFootContacts(-1);
      }
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
