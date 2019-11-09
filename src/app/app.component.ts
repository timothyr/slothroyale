import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Main } from '@game/core/Main';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  public ngAfterViewInit(): void {
    this.startGameLoop();
  }

  public startGameLoop(): void {
    let game: Main;

    const loop = (time: number) => {
      window.requestAnimationFrame(loop);
      game.SimulationLoop(time);
    };

    const init = (time: number) => {
      game = new Main(time);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(init);
  }
}
