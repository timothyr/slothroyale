import * as box2d from '@flyover/box2d';
import { MapBase, Settings } from '@game/core/MapBase';
import { Input } from '@game/core/Input';
import { Player } from '@game/player/Player';

export class Map extends MapBase {

  player: Player;

  constructor() {
    super();

    this.CreateWalls();
    this.CreateRamp();
    // this.CreateCircles(2);

    this.player = new Player(this.m_world);
  }

  public static Create(): MapBase {
    return new Map();
  }

  public Step(settings: Settings, input: Input): void {

    this.player.handleInput(input);

    super.Step(settings, input);
  }

  public CreateCircles(numCircles: number): void {
    // Create circles
    for (let i = 0; i < numCircles; i++) {
      const bd = new box2d.b2BodyDef();
      bd.type = box2d.b2BodyType.b2_dynamicBody;
      const body = this.m_world.CreateBody(bd);
      const shape = new box2d.b2CircleShape();
      shape.m_p.Set(0, 10 * (i + 1));
      shape.m_radius = 4;
      const f = body.CreateFixture(shape, 0.5);
    }
  }

  public CreateRamp(): void {
    {
      const bd = new box2d.b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      // Right slope
      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(15, 5),
          new box2d.b2Vec2(10, 10),
          new box2d.b2Vec2(20, 0),
          new box2d.b2Vec2(5, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      // Left slope
      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-15, 5),
          new box2d.b2Vec2(-7, 5),
          new box2d.b2Vec2(-20, 0),
          new box2d.b2Vec2(-2, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }

  public CreateWalls(): void {
    // Create the walls of the world.
    {
      const bd = new box2d.b2BodyDef();
      const ground = this.m_world.CreateBody(bd);

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, -10),
          new box2d.b2Vec2(40, -10),
          new box2d.b2Vec2(40, 0),
          new box2d.b2Vec2(-40, 0),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, 40),
          new box2d.b2Vec2(40, 40),
          new box2d.b2Vec2(40, 50),
          new box2d.b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(-40, -10),
          new box2d.b2Vec2(-20, -10),
          new box2d.b2Vec2(-20, 50),
          new box2d.b2Vec2(-40, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }

      {
        const shape = new box2d.b2PolygonShape();
        const vertices = [
          new box2d.b2Vec2(20, -10),
          new box2d.b2Vec2(40, -10),
          new box2d.b2Vec2(40, 50),
          new box2d.b2Vec2(20, 50),
        ];
        shape.Set(vertices, 4);
        ground.CreateFixture(shape, 0.0);
      }
    }
  }
}
