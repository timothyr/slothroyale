import { TerrainGenerator } from '@game/map/map-generation/TerrainVer/TerrainGenerator.js';
import { hexToRgb } from '@game/map/map-generation/TerrainVer/utils.js';
import * as hull from '@game/map/map-generation/hull.js';
// import * as snoe from '@game/map/map-generation/SnoeyinkKeil.js';
import * as snoe from '@game/map/map-generation/hxGeo.js';

export async function GenerateMap() {
    const width = 700;
    const height = 700;
    const terrainGenerator = await TerrainGenerator.fromImgUrl({
      debug: false,
      width: width - width % 2, // Make sure width is even
      height: height - height % 2, // Make sure height is even
      terrainTypeImg: './assets/type-2.png',
      noiseResolution: 35
    });
    console.log("frikkin loaded bud");

    // Generate Terrain Shape
    const terrainShape = terrainGenerator.generate(0)
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

        if (isBorder) {
          // Pixel is on terrain top border
          terrain[pix] = borderColor.r
          terrain[1 + pix] = borderColor.g
          terrain[2 + pix] = borderColor.b
          continue
        }

        // @@@@@@@@@@@@@@@@@@@@@@@@@
        // add pixel to hull
        hullPoints.push([x,y])
        // @@@@@@@@@@@@@@@@@@@@@@@@@

        terrain[pix] = 255
        terrain[1 + pix] = 0
        terrain[2 + pix] = 0

      }
    }

    console.log(hullPoints)

    // Make hull

    // get hull
    const pts = hull(hullPoints, 20);

    console.log("snoe", snoe.hxGeomAlgo)

    // Avgs
    // X
    const ptsX = pts.map(pt => pt[0])
    console.log("ptsX", ptsX)
    let sumX = 0
    for(let i = 0; i < ptsX.length; i++) {
        sumX += ptsX[i]
    }
    const avgX = sumX / ptsX.length

    //Y
    const ptsY = pts.map(pt => pt[1])
    let sumY = 0
    for(let i = 0; i < ptsY.length; i++) {
        sumY += ptsY[i]
    }
    const avgY = sumY / ptsY.length

    let polyCoords = []

    pts.forEach(pt => {
      polyCoords.push(pt[0])
      polyCoords.push(pt[1])
    })

    const poly = snoe.hxGeomAlgo.PolyTools.toPointArray(polyCoords);

    const decomposed = snoe.hxGeomAlgo.Bayazit.decomposePoly(poly);
    console.log("decomposed", decomposed)

    decomposed.map(cwPoly => snoe.hxGeomAlgo.PolyTools.makeCW(cwPoly))

    

    // const decomposed = snoe.hxGeomAlgo.SnoeyinkKeil.decomposePoly(poly)


    // const hxPts = pts.map(pt => snoe.hxGeomAlgo._HxPoint.HxPoint_Impl_._new(pt[0], pt[1]));
    // const poly = snoe.hxGeomAlgo.RamerDouglasPeucker.simplify(hxPts)
    // const decomposed = snoe.hxGeomAlgo.SnoeyinkKeil.decomposePoly(poly)

 

    // const decomposed = snoe.hxGeomAlgo.SnoeyinkKeil.decomposePoly(hxPts)

    // console.log("hxpts poly", decomposed)

    // _HxPoint.HxPoint_Impl_

    // const snoetest = snoe.hxGeomAlgo_SnoeyinkKeil(pts)
    // console.log("snoetest", snoetest)





    // console.log("hgull points", pts)

    console.log("avgX", avgX)
    console.log("avgY", avgY)

    return { 
      decomposed,
      avgX,
      avgY

    }
    // // draw hull
    // fgCtx.strokeStyle = "blue";
    // fgCtx.lineWidth = 2;
    // fgCtx.beginPath();
    // pts.forEach(function(px) {
    //   fgCtx.lineTo(px[0], px[1]);
    //   fgCtx.moveTo(px[0], px[1]);
    // });
    // fgCtx.stroke();
    // fgCtx.closePath();
}
