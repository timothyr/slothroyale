import { Player } from 'gamecommon/game/player/Player';
import { GameObjectGraphics } from '@game/object/GameObjectGraphics';
import { Sprite, Graphics, DisplayObject } from 'pixi.js';
import { b2World, b2Vec2, b2Sin, b2DegToRad, b2Cos} from 'gamecommon/node_modules/@flyover/box2d';
import { gfx } from '@game/graphics/Pixi';
import { Input } from 'gamecommon/game/core/InputTypes';

export class PlayerGraphics extends Player implements GameObjectGraphics {

  sprite: Sprite | Graphics;

  aimArrow: DisplayObject;

  constructor(world: b2World, position: b2Vec2, localUUID?: number, name?: string) {
    super(world, position, localUUID, name);
    this.sprite = this.createSprite();
    gfx.stage.addChild(this.sprite);
    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(this.aimAngle * this.direction * -1));
  }

  handleInput(input: Input) {
    super.handleInput(input);
  }

  increaseAimAngle(): void {
    super.increaseAimAngle();
    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(this.aimAngle * this.direction * -1));
  }

  decreaseAimAngle(): void {
    super.decreaseAimAngle();
    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(this.aimAngle * this.direction * -1));
  }

  DrawAimArrow() {
    const graphics = new Graphics();

    const angle = 0;
    const radius = 30;

    const s = radius * b2Sin(b2DegToRad(angle + 10));
    const c = radius * b2Cos(b2DegToRad(angle + 10));
    const s1 = radius * b2Sin(b2DegToRad(angle - 10));
    const c1 = radius * b2Cos(b2DegToRad(angle - 10));
    const s2 = radius * b2Sin(b2DegToRad(angle)) * 2;
    const c2 = radius * b2Cos(b2DegToRad(angle)) * 2;

    const vertices: number[] = [s, c, s1, c1, s2, c2];

    graphics.lineStyle(0);
    graphics.beginFill(0xFAFAFA, 1);
    graphics.drawPolygon(vertices);
    graphics.endFill();

    this.aimArrow = this.sprite.addChild(graphics);

    this.aimArrow.setTransform(undefined, undefined, undefined, undefined, b2DegToRad(270));
  }

  RemoveAimArrow(): void {
    this.sprite.removeChild(this.aimArrow);
  }

  createSprite(): Sprite {
    const sprite = Sprite.from('assets/bunny.png');
    sprite.anchor.set(0.5, 0.3);
    sprite.interactive = true;
    sprite.buttonMode = true;
    this.sprite = sprite;

    this.DrawAimArrow();

    return sprite;
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
    this.RemoveAimArrow();
    this.destroySprite();
  }

  destroySprite(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
