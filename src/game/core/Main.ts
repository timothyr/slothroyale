import * as box2d from '@flyover/box2d';
import { g_debugDraw, g_camera } from '@game/core/DebugDraw';
import { MapBase, Settings } from '@game/core/MapBase';
import { Map } from '@game/map/Map';
import { Fps } from '@game/core/Fps';
import { Input, MoveX, MoveY } from './Input';
// import * as PIXI from '@game/render/PixiJS/pixi.min.js'
import * as PIXI from 'pixi.js';
export class Main {
  public m_time_last = 0;

  public m_debug_div: HTMLDivElement;

  public fps: Fps;

  public map?: MapBase;
  public readonly m_settings: Settings = new Settings();

  private m_mouse = new box2d.b2Vec2();
  public m_lMouseDown = false;
  public m_rMouseDown = false;

  public readonly m_projection0: box2d.b2Vec2 = new box2d.b2Vec2();
  public readonly m_viewCenter0: box2d.b2Vec2 = new box2d.b2Vec2();

  public m_canvas_div: HTMLDivElement;
  public m_canvas_2d: HTMLCanvasElement;
  public m_ctx: CanvasRenderingContext2D | null = null;

  public m_input: Input = new Input();

  constructor(time: number, gameCanvas: HTMLCanvasElement) {
    this.fps = new Fps();

    document.body.style.backgroundColor = 'black';

    const canvas_2d: HTMLCanvasElement = this.m_canvas_2d = gameCanvas;
    g_debugDraw.m_ctx = this.m_ctx = this.m_canvas_2d.getContext('2d');

    window.addEventListener('resize', (e: UIEvent): void => { this.resize_canvas(); });
    gameCanvas.addEventListener('orientationchange', (e: Event): void => { this.resize_canvas(); });
    this.resize_canvas();

    gameCanvas.addEventListener('mousemove', (e: MouseEvent): void => { this.HandleMouseMove(e); });
    gameCanvas.addEventListener('mousedown', (e: MouseEvent): void => { this.HandleMouseDown(e); });
    gameCanvas.addEventListener('mouseup', (e: MouseEvent): void => { this.HandleMouseUp(e); });
    gameCanvas.addEventListener('mousewheel', (e: WheelEvent): void => { this.HandleMouseWheel(e); });

    gameCanvas.addEventListener('touchmove', (e: TouchEvent): void => { this.HandleTouchMove(e); });
    gameCanvas.addEventListener('touchstart', (e: TouchEvent): void => { this.HandleTouchStart(e); });
    gameCanvas.addEventListener('touchend', (e: TouchEvent): void => { this.HandleTouchEnd(e); });

    window.addEventListener('keydown', (e: KeyboardEvent): void => { this.HandleKey(e, true); });
    window.addEventListener('keyup', (e: KeyboardEvent): void => { this.HandleKey(e, false); });

    this.LoadLevel();

    this.m_time_last = time;
  }

  public LoadLevel(): void {
    this.map = Map.Create();
    this.HomeCamera();
  }

  public resize_canvas(): void {
    if (this.m_canvas_2d.width !==  window.innerWidth) {
      g_camera.m_width = this.m_canvas_2d.width =  window.innerWidth;
    }
    if (this.m_canvas_2d.height !==  window.innerHeight) {
      g_camera.m_height = this.m_canvas_2d.height = window.innerHeight;
    }
  }

  // --------- Simulation Loop ---------

  public SimulationLoop(time: number): void {
    this.m_time_last = this.m_time_last || time;

    let time_elapsed: number = time - this.m_time_last;
    this.m_time_last = time;

    if (time_elapsed > 1000) { time_elapsed = 1000; } // clamp

    this.fps.Update(time_elapsed);

    if (time_elapsed > 0) {
      const ctx: CanvasRenderingContext2D | null = this.m_ctx;

      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // ctx.strokeStyle = "blue";
        // ctx.strokeRect(this.m_mouse.x - 24, this.m_mouse.y - 24, 48, 48);

        // const mouse_world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(this.m_mouse, new box2d.b2Vec2());

        ctx.save();

          // 0,0 at center of canvas, x right, y up
        ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height);

        ctx.scale(1, -1);

        const s: number = 0.5 * g_camera.m_height / g_camera.m_extent;

        ctx.scale(s, s);
        ctx.lineWidth /= s;

          // apply camera
        ctx.scale(1 / g_camera.m_zoom, 1 / g_camera.m_zoom);
        ctx.lineWidth *= g_camera.m_zoom;

          /// ctx.rotate(-g_camera.m_roll.GetAngle());

        ctx.translate(-g_camera.m_center.x, -g_camera.m_center.y);

        if (this.map) { this.map.Step(this.m_settings, this.m_input); }

        ctx.restore();
      }
    }
  }

  // --------- Camera ----------

  public HomeCamera(): void {
    g_camera.m_zoom = (this.map) ? (this.map.GetDefaultViewZoom()) : (1.0);
    g_camera.m_center.Set(0, 0 * g_camera.m_zoom);
  }

  public MoveCamera(move: box2d.b2Vec2): void {
    const position: box2d.b2Vec2 = g_camera.m_center.Clone();
    position.SelfAdd(move);
    g_camera.m_center.Copy(position);
  }

  public ZoomCamera(zoom: number): void {
    g_camera.m_zoom *= zoom;
    g_camera.m_zoom = box2d.b2Clamp(g_camera.m_zoom, 0.02, 20);
  }

  // --------- Mouse -----------

  getMouseX(clientX: number): number {
    const bounds = this.m_canvas_2d.getBoundingClientRect();
    return (clientX - bounds.left);
  }

  getMouseY(clientY: number): number {
    const bounds = this.m_canvas_2d.getBoundingClientRect();
    return (clientY - bounds.top);
  }

  // --------- Input -----------

  public HandleKey(e: KeyboardEvent, isPressed: boolean): void {
    switch (e.key) {
      case ' ':
        this.m_input.fire = isPressed;
        break;
      case 'Control':

        break;
      case 'Shift':
        this.m_input.jump = isPressed;
        break;
      case 'ArrowLeft':
        if (isPressed) {
          this.m_input.moveX = MoveX.LEFT;
        } else {
          this.m_input.moveX = MoveX.NONE;
        }
        break;
      case 'ArrowRight':
        if (isPressed) {
          this.m_input.moveX = MoveX.RIGHT;
        } else {
          this.m_input.moveX = MoveX.NONE;
        }
        break;
      case 'ArrowDown':
        if (isPressed) {
          this.m_input.moveY = MoveY.DOWN;
        } else {
          this.m_input.moveY = MoveY.NONE;
        }
        break;
      case 'ArrowUp':
        if (isPressed) {
          this.m_input.moveY = MoveY.UP;
        } else {
          this.m_input.moveY = MoveY.NONE;
        }
        break;
    }
  }

  // --------- Mouse -----------

  public HandleMouseMove(e: MouseEvent): void {
    const rect = this.m_canvas_2d.getBoundingClientRect();
    const element: box2d.b2Vec2 = new box2d.b2Vec2(this.getMouseX(e.clientX), this.getMouseY(e.clientY));
     // const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    this.m_mouse.Copy(element);

    if (this.m_lMouseDown) {
      if (this.map) { this.map.MouseMove(world); }
    }

    if (this.m_rMouseDown) {
      // m_center = viewCenter0 - (projection - projection0);
      const projection: box2d.b2Vec2 = g_camera.ConvertElementToProjection(element, new box2d.b2Vec2());
      const diff: box2d.b2Vec2 = box2d.b2Vec2.SubVV(projection, this.m_projection0, new box2d.b2Vec2());
      const center: box2d.b2Vec2 = box2d.b2Vec2.SubVV(this.m_viewCenter0, diff, new box2d.b2Vec2());
      g_camera.m_center.Copy(center);
    }
  }

  public HandleMouseDown(e: MouseEvent): void {
    const rect = this.m_canvas_2d.getBoundingClientRect();
    const element: box2d.b2Vec2 = new box2d.b2Vec2(this.getMouseX(e.clientX), this.getMouseY(e.clientY));
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    switch (e.buttons) {
    case 1: // left mouse button
      this.m_lMouseDown = true;

      if (this.map) { this.map.MouseDown(world); }

      break;
    case 2: // right mouse button
      this.m_rMouseDown = true;
      const projection: box2d.b2Vec2 = g_camera.ConvertElementToProjection(element, new box2d.b2Vec2());
      this.m_projection0.Copy(projection);
      this.m_viewCenter0.Copy(g_camera.m_center);
      break;
    }
  }

  public HandleMouseUp(e: MouseEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.clientX, e.clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    switch (e.which) {
    case 1: // left mouse button
      this.m_lMouseDown = false;
      if (this.map) { this.map.MouseUp(world); }
      break;
    case 3: // right mouse button
      this.m_rMouseDown = false;
      break;
    }
  }

  public HandleTouchMove(e: TouchEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(this.getMouseX(e.touches[0].clientX), this.getMouseY(e.touches[0].clientY));
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());
    if (this.map) { this.map.MouseMove(world); }
    e.preventDefault();
  }

  public HandleTouchStart(e: TouchEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(this.getMouseX(e.touches[0].clientX), this.getMouseY(e.touches[0].clientY));
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());
    if (this.map) { this.map.MouseDown(world); }
    e.preventDefault();
  }

  public HandleTouchEnd(e: TouchEvent): void {
    if (this.map) { this.map.MouseUp(this.map.m_mouseWorld); }
    e.preventDefault();
  }

  public HandleMouseWheel(e: WheelEvent): void {
    if (e.deltaY < 0) {
      this.ZoomCamera(1 / 1.1);
    } else if (e.deltaY > 0) {
      this.ZoomCamera(1.1);
    }
    e.preventDefault();
  }
}
