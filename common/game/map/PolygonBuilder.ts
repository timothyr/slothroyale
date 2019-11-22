import { b2Vec2, b2Sin, b2_pi, b2Cos, b2BodyDef, b2PolygonShape, b2FixtureDef, b2Fixture, b2World } from '@flyover/box2d';

/**
 * Generate n-gon polygon with numSides as n
 * e.g. numSides = 8 for Octagon
 * @param numSides Number of sides for polygon. 8 for Octagon
 * @param size Size of polygon (box2d coords scale)
 * @param centerX X coordinate for center of polygon
 * @param centerY Y coordinate for center of polygon
 */
export function generateCircularPolygon(numSides, size, centerX, centerY): b2Vec2[] {
  const polygon: b2Vec2[] = [];

  for (let i = 0; i <= numSides; i++) {
    const vx = (b2Cos(2 * i * b2_pi / numSides) * size) + centerX;
    const vy = (b2Sin(2 * i * b2_pi / numSides) * size) + centerY;
    const vec = new b2Vec2(vx, vy);
    polygon.push(vec);
  }

  return polygon;
}



export function CreateWalls(world: b2World): void {
  // Create the walls of the world.
  {
    const bd = new b2BodyDef();
    const ground = world.CreateBody(bd);

    {
      const shape = new b2PolygonShape();
      const vertices = [
        new b2Vec2(-40, -10),
        new b2Vec2(40, -10),
        new b2Vec2(40, 0),
        new b2Vec2(-40, 0),
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      const shape = new b2PolygonShape();
      const vertices = [
        new b2Vec2(-40, 40),
        new b2Vec2(40, 40),
        new b2Vec2(40, 50),
        new b2Vec2(-40, 50),
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      const shape = new b2PolygonShape();
      const vertices = [
        new b2Vec2(-40, -10),
        new b2Vec2(-20, -10),
        new b2Vec2(-20, 50),
        new b2Vec2(-40, 50),
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }

    {
      const shape = new b2PolygonShape();
      const vertices = [
        new b2Vec2(20, -10),
        new b2Vec2(40, -10),
        new b2Vec2(40, 50),
        new b2Vec2(20, 50),
      ];
      shape.Set(vertices, 4);
      ground.CreateFixture(shape, 0.0);
    }
  }
}
