import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Main } from '@game/core/Main';
import { GenerateMap } from '@game/map/map-generation/MapGenerator';
import * as snoe from '@game/map/map-generation/hxGeo.js';

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

  // public async debugGenerateMap(debugctx: CanvasRenderingContext2D) {
  //   const hullArray = await GenerateMap();

  //   console.log("APP HULL", hullArray)

  //   debugctx.strokeStyle = "red";
  //   debugctx.lineWidth = 2;
  //   debugctx.beginPath();

  //   let i = 1;

  //   hullArray.forEach((px) => {
  //     const x = (px[0] / 2) + 50
  //     const y = px[1] / 2
  //     setTimeout(() => {
  //       // console.log(`drawing ${x}, ${x}`)
  //       debugctx.lineTo(x, y);
  //       debugctx.moveTo(x, y);
  //       debugctx.stroke();
  //       debugctx.closePath();
  //     }, i * 10)
      
  //     i += 1
  //   });

  //   setTimeout(() => {
  //     debugctx.stroke();
  //     debugctx.closePath();
  //     console.log("done draw1ng")
  //   }, i * 10)

  //   // HULL @@@@@@@@@@@@@@@@
    
  //   debugctx.strokeStyle = "red";
  //   debugctx.lineWidth = 2;
  //   debugctx.beginPath();

  //   hullArray.forEach((px) => {
  //     const x = (px[0] / 2) + 50
  //     const y = px[1] / 2

  //     debugctx.lineTo(x, y);
  //     debugctx.moveTo(x, y);
  //   });
    
  //   debugctx.stroke();
  //   debugctx.closePath();


  //   // POLY @@@@@@@@@@@@@@@@@@@@@@@@

  //   let polyCoords = []

  //   hullArray.forEach(pt => {
  //     polyCoords.push(pt[0])
  //     polyCoords.push(pt[1])
  //   })

  //   const poly = snoe.hxGeomAlgo.PolyTools.toPointArray(polyCoords);

  //   const decomposed = snoe.hxGeomAlgo.Bayazit.decomposePoly(poly);
  //   console.log("decomposed", decomposed)

  //   // DRAW POLY @@@@@@@@@@@@@@@@@@@@

  //   let drawDelayIdx = 1

  //   decomposed.forEach(polyShape => {

  //     if(polyShape.length > 30) {
        
      

  //       setTimeout(() => {
  //         console.log("poly length", polyShape.length)
  //         debugctx.strokeStyle = "white";
  //         debugctx.lineWidth = 2;
  //         debugctx.beginPath();
  //         // for pts
  //         polyShape.forEach(polyPts => {
  //           const x = (polyPts.x / 2) + 50
  //           const y = (polyPts.y / 2) - 50
  //           debugctx.lineTo(x, y);
  //           debugctx.moveTo(x, y);
  //         })

  //         debugctx.stroke();
  //         debugctx.closePath();
  //       }, drawDelayIdx * 200)

  //       drawDelayIdx += 1

  //     }
  //   })

  //   setTimeout(() => {
  //     console.log("done delay draw")
  //   }, drawDelayIdx * 200)
  // }

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

    const debugCanvasEl: HTMLCanvasElement = this.debugcanvas.nativeElement;
    this.debugctx = debugCanvasEl.getContext('2d');

    // this.debugGenerateMap(this.debugctx);
  }
}
