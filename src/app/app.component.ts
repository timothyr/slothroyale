import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Main } from '@game/core/Main';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('debugcanvas') public debugcanvas: ElementRef;

  private ctx: CanvasRenderingContext2D;
  private debugctx: CanvasRenderingContext2D;

  public ngAfterViewInit(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d');

    let game: Main;

    const loop = (time: number) => {
      window.requestAnimationFrame(loop);
      game.SimulationLoop(time);
    };

    const init = (time: number) => {
      game = new Main(time, canvasEl);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(init);
  }
}
