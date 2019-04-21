import * as PIXI from 'pixi.js';
import { gfx } from '@game/graphics/Pixi';

export function DrawPolygon(vertices: number[]): PIXI.DisplayObject {
  const graphics = new PIXI.Graphics();

  graphics.lineStyle(0);
  graphics.beginFill(0x3500FA, 1);
  graphics.drawPolygon(vertices);
  graphics.endFill();

  return gfx.stage.addChild(graphics);
}
