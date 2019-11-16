import { b2AABB, b2Vec2, b2Fixture, b2World } from '@flyover/box2d';
import * as hxGeom from '@game/map/map-generation/hxGeomAlgo/hxGeomAlgo.js';
import * as clipperLib from '@game/map/map-generation/js-angusj-clipper'; // es6 / typescript
import { UserData, ObjectType } from '@game/object/UserData';

let mapClipper;
const vertexMultiplier = 100000;

// Multiply all vertices by some large constant and round to get int
// box2d uses floats like 89.3293283 while Clipper can only handle integers
const b2Vec2ToClipper = ((v: b2Vec2) => {
  v.x = Math.round(v.x * vertexMultiplier);
  v.y = Math.round(v.y * vertexMultiplier);
});

// Divide all vertices to return the vertices back to original box2d format
const clipperTob2Vec2 = ((v: b2Vec2) => {
  v.x /= vertexMultiplier;
  v.y /= vertexMultiplier;
});

// Load clipper
clipperLib.loadNativeClipperLibInstanceAsync(
  // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
  clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
).then((clipper) => {
  mapClipper = clipper;
});

export interface DestroyedGroundResult {
  polygonsToAdd: b2Vec2[][];
  fixturesToDelete: b2Fixture[];
}

/**
 * Cut away ground polygons from an explosion polygon
 * @param aabb Bounding box around the polygon
 * @param polygon Polygon to destroy ground with
 * @param world b2World instance
 */
export function DestroyGround(aabb: b2AABB, polygon: b2Vec2[], world: b2World): DestroyedGroundResult {

  // Convert polygon from box2d format to Clipper format
  polygon.map(b2Vec2ToClipper);

  // Get list of fixtures in the area of polygon
  const fixtures: b2Fixture[] = world.QueryAllAABB(aabb);
  const polygonsToAdd: b2Vec2[][] = [];
  const fixturesToDelete: b2Fixture[] = [];

  // Iterate over all fixtures that matched the intersection of polygon
  fixtures.forEach((fixture: b2Fixture) => {

    // Check userdata of fixture and only continue if it is ground
    const userData: UserData = fixture.GetUserData() || null;
    if (!userData || userData.objectType !== ObjectType.GROUND) {
      return;
    }

    // Add original ground fixture to delete list
    fixturesToDelete.push(fixture);

    // Get shape and vertices of the ground
    const shape: any = fixture.m_shape;
    const fixtureVertices: b2Vec2[] = shape.m_vertices;

    fixtureVertices.map(b2Vec2ToClipper);

    // Clip (cut) the polygon out of the fixtures
    const destroyedPolygons: b2Vec2[][] = mapClipper.clipToPaths({
      clipType: clipperLib.ClipType.Difference,
      subjectInputs: [{ data: fixtureVertices, closed: true }],
      clipInputs: [{ data: polygon, closed: true }],
      subjectFillType: clipperLib.PolyFillType.NonZero,
      clipFillType: clipperLib.PolyFillType.NonZero,
    });

    destroyedPolygons.forEach(destroyedPolygon => {

      // Convert polygon vertices back from Clipper format to box2d format
      destroyedPolygon.map(clipperTob2Vec2);

      // Decompose the destroyed polygons into smaller polygons
      const polygons: b2Vec2[][] = hxGeom.hxGeomAlgo.SnoeyinkKeil.decomposePoly(destroyedPolygon);

      // Add new polygons to list of polys for the world to create
      polygons.forEach(p => polygonsToAdd.push(p));
    });
  });

  const destroyedGroundResult: DestroyedGroundResult = {
    polygonsToAdd,
    fixturesToDelete
  };

  return destroyedGroundResult;
}
