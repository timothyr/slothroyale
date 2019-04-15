import { TerrainGenerator } from '@game/map/map-generation/TerrainVer/TerrainGenerator.js';
import * as hxGeom from '@game/map/map-generation/hxGeom.js';
import * as marchingsquares from '@game/map/map-generation/marchingsquares.js';

export async function GenerateMap() {
    // Width & Height need to match image dimensions
    const width = 1024; // Make sure width is even
    const height = 612; // Make sure height is even
    const terrainGenerator = await TerrainGenerator.fromImgUrl({
      debug: false,
      width,
      height,
      terrainTypeImg: './assets/type-1.png',
      noiseResolution: 35
    });

    // Generate Terrain Shape
    let seed = Math.random(); // 0.11211616096027699; 
    console.log('seed', seed);

    let polygons;
    let success = false;
    while (!success) {
      try {
        polygons = GenerateTerrain(terrainGenerator, seed, width, height);
        success = true;
      } catch (err) {
        seed += 0.001;
        console.log(`Seed incremented to ${seed} because terrain generator threw error`, err);
      }
    }

    return {width, height, polygons};
}

function GenerateTerrain(terrainGenerator, seed, width, height) {

    const terrainShape = terrainGenerator.generate(seed);

    // Get generated terrain from Canvas
    let shapeData = terrainShape.getContext('2d').getImageData(0, 0, terrainShape.width, terrainShape.height);
    const terrainData = shapeData.data; // this.terrainShape.data

    // Fresh image to draw on
    const terr = new ImageData(terrainShape.width, terrainShape.height);
    let terrain = terr.data;

    // Iterate through every pixel from generated terrain
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pix = (x + y * width) * 4;

        if (terrainData[3 + pix] === 0) {
          // Pixel is not terrain
          terrain[3 + pix] = 0; // Set Alpha to 0
          continue;
        }

        // Pixel is terrain
        terrain[pix] = 255;
        terrain[1 + pix] = 0;
        terrain[2 + pix] = 0;
        terrain[3 + pix] = 255; // Set Alpha > 0
      }
    }

    // Convert each visual blob into a hull

    const len = width * height;
    const data = new Uint8Array(len);
    const hulls = [];
    let lastHull = [];

    let finished = false;

    let hullCount = 0;

    const context = terrainShape.getContext('2d');

    // This setting will erase instead of drawing to canvas
    // We need it to delete the polygons from the image as we make polygons
    context.globalCompositeOperation = 'destination-out';

    // ----------- Generate hulls from terrain -----------

    while (!finished) {

      // In case we get stuck in infinite loop
      // quit after 100 loops
      hullCount += 1;
      if (hullCount > 100) {
        finished = true;
        continue;
      }

      // Get points
      for (let i = 0; i < len; ++i) {
        // tslint:disable-next-line: no-bitwise
        data[i] = terrain[i << 2];
      }

      // Run marching squares algorithm to get an outline of the next blob
      // returns [x1,y1,x2,y2,x3,y3... etc.]
      const outlinePoints = marchingsquares.getBlobOutlinePoints(data, width, height);

      // If last hull equals current hull - then there was a duplicate
      // Delete both and finish the loop
      if (arraysEqual(lastHull, outlinePoints)) {
        hulls.pop();
        finished = true;
        continue;
      }

      lastHull = outlinePoints;

      // If outline returns nothing then finish the loop
      if (outlinePoints.length <= 1) {
        finished = true;
        continue;
      }

      // Add march to hulls
      hulls.push(outlinePoints);

      // --------- Erase polygon from image ----------

      // Erase the polygon from the image
      // So that we can get the next polygon
      context.strokeStyle = 'green';
      context.lineWidth = 5; // Draw a thick line around the polygon
      context.beginPath();

      // Draw a region for erasing the polygon
      const region = new Path2D();

      let x = 0;
      for (let index = 0; index < outlinePoints.length; index++) {
        const element = outlinePoints[index];
        if (index % 2 === 0) {
          x = element;
        } else {
          region.lineTo(x, element);
          context.lineTo(x, element);
          context.moveTo(x, element);
        }
      }

      // Draw the line around the polygon
      context.stroke();
      context.closePath();

      // Close up the region for fill
      region.closePath();

      // Fill the polygon to erase it
      context.fillStyle = `rgba(0,0,255,100)`;
      context.fill(region);

      shapeData = context.getImageData(0, 0, terrainShape.width, terrainShape.height);
      terrain = shapeData.data;
    }

    // ---------- Convert hulls into small polygons ----------

    const polygons = [];

    hulls.forEach(hull => {
      // Convert hull into data that hxGeomAlgo can use
      let poly = hxGeom.hxGeomAlgo.PolyTools.toPointArray(hull);

      // Remove duplicate and unnecessary vertices
      poly = hxGeom.hxGeomAlgo.RamerDouglasPeucker.simplify(poly);

      // SnoeyinKeil needs an even number of vertices
      if (poly.length % 2 === 1) {
        poly.pop();
      }

      // Use SnoeyinkKeil algorithm to decompose polygon into many small polygons
      const hullPolygons = hxGeom.hxGeomAlgo.SnoeyinkKeil.decomposePoly(poly);

      // Add the polygons to the total
      polygons.push(...hullPolygons);
    });

    return polygons;
}

/**
 * Returns true if two arrays are equal
 * @param arr1 first array
 * @param arr2 second array
 */
function arraysEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
      return false;
  }
  for (let i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i]) {
          return false;
      }
  }

  return true;
}
