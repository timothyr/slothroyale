import { Grenade } from 'gamecommon/game/weapon/Grenade';
import { GameObjectGraphics } from '@game/object/GameObjectGraphics';
import { b2World, b2Vec2 } from 'gamecommon/node_modules/@flyover/box2d';
import { gfx, metersToPixel } from '@game/graphics/Pixi';
import { Sprite, Graphics } from 'pixi.js';

export class GrenadeGraphics extends Grenade implements GameObjectGraphics {

  sprite: Sprite | Graphics;

  constructor(world: b2World, position: b2Vec2, aimAngle: number, direction: number) {
    super(world, position, aimAngle, direction);
    this.sprite = this.createSprite();
    gfx.stage.addChild(this.sprite);
  }

  createSprite(): Sprite | Graphics {
    const graphics = new Graphics();

    graphics.lineStyle(0);
    graphics.beginFill(0xF500FA, 1);
    graphics.drawCircle(0, 0, 0.5 * metersToPixel);
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
