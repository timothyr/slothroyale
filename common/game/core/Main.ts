import { MapBase, Settings } from './MapBase';
import { Map, MapOptions } from '../map/Map';
import { Fps } from './Fps';
import { Input, MoveX, MoveY } from './InputTypes';
import { Controls } from './Controls';

export class Main {
  public timeLast = 0;

  public fps: Fps;

  public map?: MapBase;
  public readonly physicsSettings: Settings = new Settings();

  public input: Input = new Input();
  public controls: Controls = new Controls(this.input);

  constructor(time: number) {
    this.fps = new Fps();

    document.body.style.backgroundColor = 'black';

    this.timeLast = time;
  }

  public LoadLevel(mapOptions?: MapOptions): void {
    this.map = Map.Create(mapOptions);
  }

  // --------- Simulation Loop ---------

  public SimulationLoop(time: number): void {
    this.timeLast = this.timeLast || time;

    let timeElapsed: number = time - this.timeLast;
    this.timeLast = time;

    if (timeElapsed > 1000) { timeElapsed = 1000; } // clamp

    this.fps.Update(timeElapsed);

    // Main update function
    if (timeElapsed > 0) {
      if (this.map) { this.map.Step(this.physicsSettings, this.input); }
    }
  }
}
