import { Application } from 'pixi.js';

export const metersToPixel = 20;

export class PixiGraphics extends Application {
    public metersToPixel = 20;
}

export const gfx: PixiGraphics = new PixiGraphics({transparent: true, resizeTo: window});
export const gfxView: HTMLCanvasElement = document.body.appendChild(gfx.view);
gfxView.className = 'game-canvas';

gfx.stage.position.x = gfx.screen.width / 2;
gfx.stage.position.y = gfx.screen.height / 2;
