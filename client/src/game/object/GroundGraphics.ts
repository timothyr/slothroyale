import { Ground } from 'gamecommon/game/object/Ground';
import { GameObjectGraphics } from './GameObjectGraphics';
import { b2World, b2Vec2 } from 'gamecommon/node_modules/@flyover/box2d';
import { gfx, metersToPixel } from '@game/graphics/Pixi';
import { Graphics, Sprite } from 'pixi.js';

export class GroundGraphics extends Ground implements GameObjectGraphics {

  sprite: Sprite | Graphics;

  constructor(world: b2World, position: b2Vec2 = null, bodyParams: any) {
    super(world, null, bodyParams);
    this.sprite = this.createSprite(bodyParams);
    gfx.stage.addChild(this.sprite);
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
