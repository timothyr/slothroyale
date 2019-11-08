import * as PIXI from 'pixi.js';
import { g_camera } from '@game/core/DebugDraw';

export const metersToPixel = 20;

export class PixiGraphics extends PIXI.Application {
    public metersToPixel = 20;
}

export const gfx: PixiGraphics = new PixiGraphics({transparent: true, resizeTo: window});
export const gfxView: HTMLCanvasElement = document.body.appendChild(gfx.view);
gfxView.className = 'game-canvas';

g_camera.m_zoom = gfx.metersToPixel;
// g_camera.m_width = gfx.screen.width;
// g_camera.m_height = gfx.screen.height;
// g_camera.m_center.Copy(new b2Vec2(gfx.screen.width / 2, gfx.screen.height / 2));
// gfx.scre = gfx.screen.width;
gfx.stage.position.x = gfx.screen.width / 2;
gfx.stage.position.y = gfx.screen.height / 2;
