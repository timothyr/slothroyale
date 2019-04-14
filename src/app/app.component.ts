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

  private lastTranslation: any = {
    x: 0,
    y: 0
  };

  public async debugGenerateMap(debugctx: CanvasRenderingContext2D) {
    const hullArray = await GenerateMap();

    // // fgCanvas.width = this.terr.width
    // // fgCanvas.height = this.terr.height
    const debugCanvasEl: HTMLCanvasElement = this.debugcanvas.nativeElement;

    debugCanvasEl.width = hullArray.terr.width;
    debugCanvasEl.height = hullArray.terr.height;

    // debugctx.putImageData(hullArray.terr, 0, 0);


    // hullArray.hulls.forEach(hull => {
    //   console.log('hull', hull);
    // });

    // // // ******** marching
    hullArray.hulls.forEach(hull => {
      debugctx.strokeStyle = 'green';// `rgba(0,0,255,0.25)`;// "blue";
      debugctx.lineWidth = 3;
      debugctx.beginPath();
  
      let last = 0;
  
      for (let index = 0; index < hull.length; index++) {
        const element = hull[index];
        if (index % 2 === 0) {
          last = element;
        } else {
          debugctx.lineTo(last, element);
          debugctx.moveTo(last, element);
        }
      }
  
      debugctx.stroke();
      debugctx.closePath();
    })

    


    // // // ******** end of marching

    //  // ******** marching 2

    // debugctx.strokeStyle = 'blue'; // `rgba(0,0,255,0.25)`;// "blue";
    // debugctx.lineWidth = 10;
    // debugctx.beginPath();

    // last = 0;

    // for (let index = 0; index < hullArray.outlinePoints2.length; index++) {
    //    const element = hullArray.outlinePoints2[index];
    //    if (index % 2 === 0) {
    //      last = element;
    //    } else {
    //      debugctx.lineTo(last, element);
    //      debugctx.moveTo(last, element);
    //    }
    //  }

    // debugctx.stroke();
    // debugctx.closePath();


     // ******** end of marching 2

     // ****** test delete ********

    // debugctx.globalCompositeOperation = 'destination-out';

    // debugctx.strokeStyle = 'green'; // `rgba(0,0,255,0.25)`;// "blue";
    // debugctx.lineWidth = 3;
    // debugctx.beginPath();

    // const region = new Path2D();

    // const first = true;
    // last = 0;

    // for (let index = 0; index < hullArray.outlinePoints.length; index++) {
    //   const element = hullArray.outlinePoints[index];
    //   if (index % 2 === 0) {
    //     last = element;
    //   } else {

    //     region.lineTo(last, element);
    //     debugctx.lineTo(last, element);
    //     debugctx.moveTo(last, element);

    //   }
    // }
    // debugctx.stroke();
    // debugctx.closePath();

    // region.closePath();

    // // do a filling

    // debugctx.fillStyle = `rgba(0,0,255,1)`;
    // debugctx.fill(region);

     // end of ******* test delete ***********
  }

  public getMiddle(start, arr): number {
    let minX = null;
    let maxX = null;
    for (let index = start; index < arr.length; index += 2) {
      const element = arr[index];

      if (minX === null && maxX === null) {
        minX = element;
        maxX = element;
        continue;
      }

      minX = Math.min(minX, element);
      maxX = Math.max(maxX, element);
    }

    return ((maxX - minX) / 2) + minX;
  }


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

    this.debugGenerateMap(this.debugctx);
  }
}

   // debugctx.strokeStyle = `rgba(0,0,255,0.25)`//"blue";
    // debugctx.lineWidth = 1;
    // debugctx.beginPath();

    // hullArray.hullPoints.forEach((px) => {
    //   const x = (px[0] / 1) + 0
    //   const y = px[1] / 1

    //     // console.log(`drawing ${x}, ${x}`)
    //     debugctx.lineTo(x, y);
    //     debugctx.moveTo(x, y);

    // });

    //   debugctx.stroke();
    //   debugctx.closePath();

//     // TRASH@@@@@@@@@@@@@@@@@@

//     debugctx.strokeStyle = `rgba(0,0,255,0.25)`//"blue";
//     debugctx.lineWidth = 1;
//     debugctx.beginPath();


//     hullArray.hullPoints.forEach((px) => {
//       const x = (px[0] / 1) + 0
//       const y = px[1] / 1

//         // console.log(`drawing ${x}, ${x}`)
//         debugctx.lineTo(x, y);
//         debugctx.moveTo(x, y);

//     });

//       debugctx.stroke();
//       debugctx.closePath();
// // end trash @@@@@@@@@@@@@@@@@@@@@@@@@@

    // console.log("APP HULL", hullArray)

    // debugctx.strokeStyle = "red";
    // debugctx.lineWidth = 2;
    // debugctx.beginPath();

    // let i = 1;

    // hullArray.forEach((px) => {
    //   const x = (px[0] / 5) + 50
    //   const y = px[1] / 5
    //   setTimeout(() => {
    //     // console.log(`drawing ${x}, ${x}`)
    //     debugctx.lineTo(x, y);
    //     debugctx.moveTo(x, y);
    //     debugctx.stroke();
    //     debugctx.closePath();
    //   }, i * 10)

    //   i += 1
    // });

    // setTimeout(() => {
    //   debugctx.stroke();
    //   debugctx.closePath();
    //   console.log("done draw1ng")
    // }, i * 10)

    // HULL @@@@@@@@@@@@@@@@

    // debugctx.strokeStyle = "red";
    // debugctx.lineWidth = 2;
    // debugctx.beginPath();

    // hullArray.forEach((px) => {
    //   const x = (px[0] / 2) + 50
    //   const y = px[1] / 2

    //   debugctx.lineTo(x, y);
    //   debugctx.moveTo(x, y);
    // });

    // debugctx.stroke();
    // debugctx.closePath();


    // // POLY @@@@@@@@@@@@@@@@@@@@@@@@

    // let polyCoords = []

    // hullArray.forEach(pt => {
    //   polyCoords.push(pt[0])
    //   polyCoords.push(pt[1])
    // })

    // const poly = snoe.hxGeomAlgo.PolyTools.toPointArray(polyCoords);

    // const decomposed = snoe.hxGeomAlgo.Bayazit.decomposePoly(poly);
    // console.log("decomposed", decomposed)

    // // DRAW POLY @@@@@@@@@@@@@@@@@@@@

    // let drawDelayIdx = 1

    // decomposed.forEach(polyShape => {

    //   if(polyShape.length > 30) {



    //     setTimeout(() => {
    //       console.log("poly length", polyShape.length)
    //       debugctx.strokeStyle = "white";
    //       debugctx.lineWidth = 2;
    //       debugctx.beginPath();
    //       // for pts
    //       polyShape.forEach(polyPts => {
    //         const x = (polyPts.x / 2) + 50
    //         const y = (polyPts.y / 2) - 50
    //         debugctx.lineTo(x, y);
    //         debugctx.moveTo(x, y);
    //       })

    //       debugctx.stroke();
    //       debugctx.closePath();
    //     }, drawDelayIdx * 200)

    //     drawDelayIdx += 1

    //   }
    // })

    // setTimeout(() => {
    //   console.log("done delay draw")
    // }, drawDelayIdx * 200)
