import { Ground } from 'gamecommon/game/object/Ground';
import { GameObjectGraphics } from './GameObjectGraphics';
import { b2World, b2Vec2 } from 'gamecommon/node_modules/@flyover/box2d';
import { gfx, metersToPixel } from '@game/graphics/Pixi';
import { Graphics, Sprite } from 'pixi.js';
import { GroundSchema } from 'gamecommon/game/schema/Ground';

export class GroundGraphics extends Ground implements GameObjectGraphics {

  sprite: Sprite | Graphics;

  constructor(world: b2World, position: b2Vec2 = null, bodyParams: any, localUUID?: number) {
    super(world, null, bodyParams);
    this.sprite = this.createSprite(bodyParams);
    gfx.stage.addChild(this.sprite);
  }

  public static CreateGroundFromServer(world: b2World, groundSchema: GroundSchema, localUUID: number): GroundGraphics {
    // Convert back to floats
    const vertices = groundSchema.vertices.map(v => v / Ground.vertexMultiplier);

    const polygon: b2Vec2[] = [];

    // Convert 1-d array of [x1, y1, x2, y2, ...] into array of form [{x: 0, y: 1}, ...]
    while (vertices.length) {
      const tuple = vertices.splice(0, 2);
      const vec = new b2Vec2(tuple[0], tuple[1]);
      polygon.push(vec);
    }

    const bodyParams = {polygon};
    return new GroundGraphics(world, null, bodyParams, localUUID);
  }

  createSprite(bodyParams: any): Sprite | Graphics {

    const pixiVertices: number[] = [];

    bodyParams.polygon.forEach((v: b2Vec2) => {
      pixiVertices.push(v.x * metersToPixel);
      pixiVertices.push(-v.y * metersToPixel);
    });

    const graphics = new Graphics();

    graphics.lineStyle(0);
    graphics.beginFill(0x3500FA, 1);
    graphics.drawPolygon(pixiVertices);
    graphics.endFill();

    return graphics;
  }

  getSprite(): Sprite | Graphics {
    return this.sprite;
  }

  update(): void {
    super.update();
    this.updateSprite();
  }

  updateSprite(): void {
    const worldCenter = this.body.GetWorldCenter();
    this.sprite.position.set(worldCenter.x * gfx.metersToPixel, -worldCenter.y * gfx.metersToPixel);
  }

  // Destroy body and graphics
  destroy(): void {
    super.destroy();
    this.destroySprite();
  }

  destroySprite(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
