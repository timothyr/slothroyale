import { gfx } from './Pixi';
import { DisplayObject, Graphics } from 'pixi.js';

export function DrawBorderPolygon(vertices: number[]): DisplayObject {
  const graphics = new Graphics();

  graphics.lineStyle(0);
  graphics.beginFill(0x9500FA, 1);
  graphics.drawPolygon(vertices);
  graphics.endFill();

  return gfx.stage.addChild(graphics);
}

export function DrawPolygon(vertices: number[]): DisplayObject {
  const graphics = new Graphics();

  graphics.lineStyle(0);
  graphics.beginFill(0x3500FA, 1);
  graphics.drawPolygon(vertices);
  graphics.endFill();

  return gfx.stage.addChild(graphics);
}

export function RemovePolygon(displayObject: DisplayObject): void {
  gfx.stage.removeChild(displayObject);
}
