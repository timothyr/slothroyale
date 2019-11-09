import { MapBase, Settings } from '@game/core/MapBase';
import { Map } from '@game/map/Map';
import { Fps } from '@game/core/Fps';
import { Input, MoveX, MoveY } from './Input';

export class Main {
  public m_time_last = 0;

  public fps: Fps;

  public map?: MapBase;
  public readonly m_settings: Settings = new Settings();

  public m_input: Input = new Input();

  constructor(time: number) {
    this.fps = new Fps();

    document.body.style.backgroundColor = 'black';

    window.addEventListener('keydown', (e: KeyboardEvent): void => { this.HandleKey(e, true); });
    window.addEventListener('keyup', (e: KeyboardEvent): void => { this.HandleKey(e, false); });

    this.LoadLevel();

    this.m_time_last = time;
  }

  public LoadLevel(): void {
    this.map = Map.Create();
  }

  // --------- Simulation Loop ---------

  public SimulationLoop(time: number): void {
    this.m_time_last = this.m_time_last || time;

    let time_elapsed: number = time - this.m_time_last;
    this.m_time_last = time;

    if (time_elapsed > 1000) { time_elapsed = 1000; } // clamp

    this.fps.Update(time_elapsed);

    if (time_elapsed > 0) {
 
        if (this.map) { this.map.Step(this.m_settings, this.m_input); }

    }
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
}
