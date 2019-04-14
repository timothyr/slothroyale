import { TerrainGenerator } from '@game/map/map-generation/TerrainVer/TerrainGenerator.js';
import { hexToRgb } from '@game/map/map-generation/TerrainVer/utils.js';
import * as hull from '@game/map/map-generation/hull.js';
import * as snoe from '@game/map/map-generation/hxGeo.js';
import * as marchingsquares from '@game/map/map-generation/marchingsquares.js';

export async function GenerateMap() {
    const width = 1024;
    const height = 612;
    const terrainGenerator = await TerrainGenerator.fromImgUrl({
      debug: false,
      width: width - width % 2, // Make sure width is even
      height: height - height % 2, // Make sure height is even
      terrainTypeImg: './assets/type-1.png',
      noiseResolution: 35
    });
    console.log("frikkin loaded bud");

    // Generate Terrain Shape
    const terrainShape = terrainGenerator.generate(Math.random())
    console.log("terrainshape", terrainShape)

    const shapeData = terrainShape.getContext('2d').getImageData(0, 0, terrainShape.width, terrainShape.height)
    const terr = new ImageData(terrainShape.width, terrainShape.height)

    // Texturize
    const w = terr.width
    const h = terr.height

    const terrainData = shapeData.data//this.terrainShape.data
    const terrain = terr.data

    const borderWidth = 8//this.options.borderWidth
    const borderColor = hexToRgb('#89c53f')

    let hullPoints = []

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pix = (x + y * w) * 4

        if (terrainData[3 + pix] === 0) {
          // Pixel is not terrain
          terrain[pix] = 0
          terrain[1 + pix] = 0
          terrain[2 + pix] = 0
          terrain[3 + pix] = 0
          continue
        }

        // Pixel is terrain
        terrain[3 + pix] = terrainData[3 + pix]   // Copy alpha

        let isBorder = false
        if (borderWidth >= 1) {
          for (let bw = 1; bw <= borderWidth; bw++) {
            if (terrainData[(x + (y - bw) * w) * 4] === 0) {
              isBorder = true
              break
            }
          }
        }

        // if (isBorder) {
        //   // Pixel is on terrain top border
        //   terrain[pix] = borderColor.r
        //   terrain[1 + pix] = borderColor.g
        //   terrain[2 + pix] = borderColor.b
        //   continue
        // }

        // @@@@@@@@@@@@@@@@@@@@@@@@@
        // add pixel to hull
        hullPoints.push([x,y])
        // @@@@@@@@@@@@@@@@@@@@@@@@@

        terrain[pix] = 255
        terrain[1 + pix] = 0
        terrain[2 + pix] = 0

      }
    }

    console.log("marching", marchingsquares)

    // ********** MARCHING

    const len = width * height;
    const data = new Uint8Array(len);

    for (let i = 0; i < len; ++i){
        data[i] = terrain[i << 2];
    }

    const outlinePoints = marchingsquares.getBlobOutlinePoints(data, width, height);  // returns [x1,y1,x2,y2,x3,y3... etc.]

    console.log("marching out", outlinePoints)

    // ******* end of MARCHING

    // paste onto canvas
    const context = terrainShape.getContext('2d');
    context.clearRect(0, 0, terrainShape.width, terrainShape.height);
    context.putImageData(terr, 0, 0);
    //

    // lasso around march
    // context.beginPath();
    context.globalCompositeOperation = 'destination-out';

    context.strokeStyle = 'green'; // `rgba(0,0,255,0.25)`;// "blue";
    context.lineWidth = 5;
    context.beginPath();

    const region = new Path2D();

    const first = true;
    let last = 0;

    for (let index = 0; index < outlinePoints.length; index++) {
      const element = outlinePoints[index];
      if (index % 2 === 0) {
        last = element;
      } else {

        region.lineTo(last, element);
        context.lineTo(last, element);
        context.moveTo(last, element);

      }
    }
    context.stroke();
    context.closePath();

    region.closePath();

    // do a filling

    context.fillStyle = `rgba(0,0,255,1)`;
    context.fill(region);

    // end of lasso around march

    // get data again
    const shapeData2 = context.getImageData(0, 0, terrainShape.width, terrainShape.height)
    const terrain2 = shapeData2.data

    //marching 2

    // ********** MARCHING

    const data2 = new Uint8Array(len);

    for (let i = 0; i < len; ++i){
        data2[i] = terrain2[i << 2];
    }

    const outlinePoints2 = marchingsquares.getBlobOutlinePoints(data2, width, height);  // returns [x1,y1,x2,y2,x3,y3... etc.]

    console.log("marching out2", outlinePoints2)

    // ******* end of MARCHING


    let hulls = []


    console.log(hullPoints)

    return {
      terr,
      hullPoints
    ,hulls,outlinePoints, outlinePoints2}

    // return hullPoints

    // // Make hull

    // // get hull
    // const pts = hull(hullPoints, 20);

    // console.log("snoe", snoe.hxGeomAlgo)

    // // Avgs
    // // X
    // const ptsX = pts.map(pt => pt[0])
    // console.log("ptsX", ptsX)
    // let sumX = 0
    // for(let i = 0; i < ptsX.length; i++) {
    //     sumX += ptsX[i]
    // }
    // const avgX = sumX / ptsX.length

    // //Y
    // const ptsY = pts.map(pt => pt[1])
    // let sumY = 0
    // for(let i = 0; i < ptsY.length; i++) {
    //     sumY += ptsY[i]
    // }
    // const avgY = sumY / ptsY.length

    // let polyCoords = []

    // pts.forEach(pt => {
    //   polyCoords.push(pt[0])
    //   polyCoords.push(pt[1])
    // })

    // // Convert to a hxGeomAlgo compatible polygon
    // let poly = snoe.hxGeomAlgo.PolyTools.toPointArray(polyCoords);

    // // Remove duplicate and unnecessary vertices
    // poly = snoe.hxGeomAlgo.RamerDouglasPeucker.simplify(poly);

    // // SnoeyinKeil needs an even number of vertices
    // if (poly.length % 2 === 1) {
    //   poly.pop()
    // }

    // // Use SnoeyinKeil algorithm to decompose polygon into many small polygons
    // const decomposed = snoe.hxGeomAlgo.SnoeyinkKeil.decomposePoly(poly);

    // console.log("avgX", avgX)
    // console.log("avgY", avgY)

    // return { 
    //   decomposed,
    //   avgX,
    //   avgY

    // }
    // // // draw hull
    // // fgCtx.strokeStyle = "blue";
    // // fgCtx.lineWidth = 2;
    // // fgCtx.beginPath();
    // // pts.forEach(function(px) {
    // //   fgCtx.lineTo(px[0], px[1]);
    // //   fgCtx.moveTo(px[0], px[1]);
    // // });
    // // fgCtx.stroke();
    // // fgCtx.closePath();
}
