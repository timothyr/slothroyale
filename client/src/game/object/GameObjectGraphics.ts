import { Sprite, Graphics } from 'pixi.js';

export interface GameObjectGraphics {
  sprite: Sprite | Graphics;

  createSprite(params?: any): Sprite | Graphics;
  getSprite(): Sprite | Graphics;
  updateSprite(): void;
  destroySprite(): void;
}
