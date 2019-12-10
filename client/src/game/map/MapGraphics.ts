import { Map, MapOptions } from 'gamecommon/game/map/Map';
import { b2Vec2 } from '@flyover/box2d';
import { gfx } from '@game/graphics/Pixi';
import { Point, interaction } from 'pixi.js';
import { GameObjectFactory } from 'gamecommon/game/object/GameObjectFactory';
import { World } from 'gamecommon/game/schema/World';
import { Ground } from 'gamecommon/game/object/Ground';
import { GameObjectFactoryClient } from '@game/object/GameObjectFactoryClient';
import { Player } from 'gamecommon/game/player/Player';

export class MapGraphics extends Map {

  gameObjectFactory: GameObjectFactoryClient;

  mapPivot: Point = new Point(0, 0);
  mouseDragPos: Point = new Point(0, 0);
  draggingMap = false;

  // player: PlayerGraphics = null;

  constructor(mapOptions: MapOptions, gameObjectFactory: GameObjectFactoryClient) {
    super(mapOptions, gameObjectFactory);
    document.body.style.backgroundColor = 'black';
    this.addMapEventHandlers();
  }

  public static CreateFromWorld(world: World, gameObjectFactory: GameObjectFactoryClient): MapGraphics {
    const mapOptions: MapOptions = {
      width: world.mapWidthPx,
      height: world.mapHeightPx,
      polygons: [],
      playerPositions: []
    }
    return new MapGraphics(mapOptions, gameObjectFactory);
  }

  public static Create(mapOptions: MapOptions, gameObjectFactory: GameObjectFactoryClient): MapGraphics {
    return new MapGraphics(mapOptions, gameObjectFactory);
  }

  public AddPlayer(player: Player, sessionId: string) {
    const playerObject = this.gameObjectFactory.createPlayerFromServer(this.world, player, sessionId);
    this.players[player.localUUID] = playerObject;
    this.curPlayerLocalUUID = player.localUUID;
    console.log("created player", playerObject);
  }

  public AddGround(ground: Ground) {
    const groundObject = this.gameObjectFactory.createGroundFromServer(this.world, ground);
    this.groundObjects[ground.localUUID] = groundObject;
  }

  // ----- Event Handlers -----

  screenToWorldPos(event): b2Vec2 {
    const x = event.data.getLocalPosition(gfx.stage).x / gfx.metersToPixel;
    const y = event.data.getLocalPosition(gfx.stage).y / gfx.metersToPixel;

    return new b2Vec2(x, -y);
  }

  // Player event handlers

  // addPlayerEventHandlers() {
  //   // Set eventhandlers for player
  //   this.player.getSprite()
  //     // events for drag start
  //     .on('mousedown', (event) => this.onPlayerDragStart(event))
  //     .on('touchstart', (event) => this.onPlayerDragStart(event))
  //     // events for drag end
  //     .on('mouseup', (event) => this.onPlayerDragEnd(event))
  //     .on('mouseupoutside', (event) => this.onPlayerDragEnd(event))
  //     .on('touchend', (event) => this.onPlayerDragEnd(event))
  //     .on('touchendoutside', (event) => this.onPlayerDragEnd(event))
  //     // events for drag move
  //     .on('mousemove', (event) => this.onPlayerDragMove(event))
  //     .on('touchmove', (event) => this.onPlayerDragMove(event));
  // }

  // onPlayerDragStart(event: interaction.InteractionEvent): void {
  //   event.stopPropagation();
  //   this.player.getSprite().alpha = 0.5;
  //   this.MouseDown(this.screenToWorldPos(event));
  //   this.draggingMap = false;
  // }

  // onPlayerDragEnd(event: interaction.InteractionEvent): void {
  //   event.stopPropagation();
  //   this.player.getSprite().alpha = 1;
  //   this.MouseUp(this.screenToWorldPos(event));
  // }

  // onPlayerDragMove(event: interaction.InteractionEvent): void {
  //   event.stopPropagation();
  //   this.MouseMove(this.screenToWorldPos(event));
  // }

  // Map event handlers

  // Add mouse and touch handlers for map
  addMapEventHandlers(): void {
    gfx.renderer.plugins.interaction.on('pointerdown', (e) => this.onMapMouseDown(e));
    gfx.renderer.plugins.interaction.on('mouseup', (e) => this.onMapMouseUp(e));
    gfx.renderer.plugins.interaction.on('mousemove', (e) => this.onMapDragMove(e));
    gfx.renderer.plugins.interaction.on('touchmove', (e) => this.onMapDragMove(e));
  }

  // Touch map

  onMapMouseDown(event: interaction.InteractionEvent): void {
    const hit = this.MouseDown(this.screenToWorldPos(event));
    if (!hit) {
      this.onMapDragStart(event);
    }
  }

  onMapMouseUp(event: interaction.InteractionEvent): void {
    if (this.draggingMap) {
      this.onMapDragEnd();
    }
  }

  // Drag map to move

  onMapDragStart(event: interaction.InteractionEvent): void {
    event.data.global.copyTo(this.mouseDragPos);
    this.draggingMap = true;
  }

  onMapDragEnd(): void {
    this.draggingMap = false;
  }

  onMapDragMove(event: interaction.InteractionEvent): void {
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

    console.log("clicky");

    return hitFixture;
  }
}
