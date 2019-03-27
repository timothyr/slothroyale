import * as box2d from '@flyover/box2d';
import { g_debugDraw } from '@game/core/DebugDraw';
import { Input } from './Input';

export class Settings {
  public hz = 60;
  public velocityIterations = 8;
  public positionIterations = 3;
  public drawShapes = true;
  public drawJoints = true;
  public drawAABBs = false;
  public drawContactPoints = false;
  public drawContactNormals = false;
  public drawContactImpulse = false;
  public drawFrictionImpulse = false;
  public drawCOMs = false;
  public drawControllers = true;
  public drawStats = false;
  public drawProfile = false;
  public enableWarmStarting = true;
  public enableContinuous = true;
  public enableSubStepping = false;
  public enableSleep = true;
  public pause = false;
  public singleStep = false;
}

export class DestructionListener extends box2d.b2DestructionListener {
  public map: MapBase;

  constructor(map: MapBase) {
    super();

    this.map = map;
  }

  public SayGoodbyeJoint(joint: box2d.b2Joint): void {
    if (this.map.m_mouseJoint === joint) {
      this.map.m_mouseJoint = null;
    } else {
      this.map.JointDestroyed(joint);
    }
  }

  public SayGoodbyeFixture(fixture: box2d.b2Fixture): void {}
}

/**
 * Contact Point (debug draw collisions)
 */
export class ContactPoint {
  public fixtureA!: box2d.b2Fixture;
  public fixtureB!: box2d.b2Fixture;
  public readonly normal: box2d.b2Vec2 = new box2d.b2Vec2();
  public readonly position: box2d.b2Vec2 = new box2d.b2Vec2();
  public state: box2d.b2PointState = box2d.b2PointState.b2_nullState;
  public normalImpulse = 0;
  public tangentImpulse = 0;
  public separation = 0;
}

export class MapBase extends box2d.b2ContactListener {

  constructor() {
      super();

      const gravity: box2d.b2Vec2 = new box2d.b2Vec2(0, -10);
      this.m_world = new box2d.b2World(gravity);

      this.m_mouseJoint = null;

      this.m_destructionListener = new DestructionListener(this);
      this.m_world.SetDestructionListener(this.m_destructionListener);
      this.m_world.SetContactListener(this);
      this.m_world.SetDebugDraw(g_debugDraw);

      const bodyDef: box2d.b2BodyDef = new box2d.b2BodyDef();
      this.m_groundBody = this.m_world.CreateBody(bodyDef);
  }

  // Contact points (debug)
  public static readonly k_maxContactPoints: number = 2048;
  public m_world: box2d.b2World;
  // Mouse
  public m_mouseJoint: box2d.b2MouseJoint | null = null;
  public readonly m_mouseWorld: box2d.b2Vec2 = new box2d.b2Vec2();
  public m_stepCount = 0;
  public m_destructionListener: DestructionListener;
  public m_groundBody: box2d.b2Body;
  public readonly m_points: ContactPoint[] = box2d.b2MakeArray(MapBase.k_maxContactPoints, (i) => new ContactPoint());
  public m_pointCount = 0;

  // ---------- Step ------------

  public Step(settings: Settings, input: Input): void {
    const timeStep = settings.hz > 0 ? 1 / settings.hz : 0;

    let flags = box2d.b2DrawFlags.e_none;
    if (settings.drawShapes) { flags |= box2d.b2DrawFlags.e_shapeBit;        }
    if (settings.drawJoints) { flags |= box2d.b2DrawFlags.e_jointBit;        }
    if (settings.drawAABBs ) { flags |= box2d.b2DrawFlags.e_aabbBit;         }
    if (settings.drawCOMs  ) { flags |= box2d.b2DrawFlags.e_centerOfMassBit; }
    if (settings.drawControllers  ) { flags |= box2d.b2DrawFlags.e_controllerBit; }
    g_debugDraw.SetFlags(flags);

    this.m_world.SetAllowSleeping(settings.enableSleep);
    this.m_world.SetWarmStarting(settings.enableWarmStarting);
    this.m_world.SetContinuousPhysics(settings.enableContinuous);
    this.m_world.SetSubStepping(settings.enableSubStepping);

    this.m_pointCount = 0;

    this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations);

    this.m_world.DrawDebugData();

    if (timeStep > 0) {
      ++this.m_stepCount;
    }

    if (settings.drawContactPoints) {
      const k_impulseScale = 0.1;
      const k_axisScale = 0.3;

      for (let i = 0; i < this.m_pointCount; ++i) {
        const point = this.m_points[i];

        if (point.state === box2d.b2PointState.b2_addState) {
          // Add
          g_debugDraw.DrawPoint(point.position, 10, new box2d.b2Color(0.3, 0.95, 0.3));
        } else if (point.state === box2d.b2PointState.b2_persistState) {
          // Persist
          g_debugDraw.DrawPoint(point.position, 5, new box2d.b2Color(0.3, 0.3, 0.95));
        }

        if (settings.drawContactNormals) {
          const p1 = point.position;
          const p2: box2d.b2Vec2 = box2d.b2Vec2.AddVV(p1, box2d.b2Vec2.MulSV(k_axisScale, point.normal, box2d.b2Vec2.s_t0), new box2d.b2Vec2());
          g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.9));
        } else if (settings.drawContactImpulse) {
          const p1 = point.position;
          const p2: box2d.b2Vec2 = box2d.b2Vec2.AddVMulSV(p1, k_impulseScale * point.normalImpulse, point.normal, new box2d.b2Vec2());
          g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
        }

        if (settings.drawFrictionImpulse) {
          const tangent: box2d.b2Vec2 = box2d.b2Vec2.CrossVOne(point.normal, new box2d.b2Vec2());
          const p1 = point.position;
          const p2: box2d.b2Vec2 = box2d.b2Vec2.AddVMulSV(p1, k_impulseScale * point.tangentImpulse, tangent, new box2d.b2Vec2());
          g_debugDraw.DrawSegment(p1, p2, new box2d.b2Color(0.9, 0.9, 0.3));
        }
      }
    }
  }

  // ---------- Joints ----------

  public JointDestroyed(joint: box2d.b2Joint): void {}

  // ---------- Mouse -----------

  public MouseDown(p: box2d.b2Vec2): void {
    this.m_mouseWorld.Copy(p);

    if (this.m_mouseJoint !== null) {
      this.m_world.DestroyJoint(this.m_mouseJoint);
      this.m_mouseJoint = null;
    }

    let hit_fixture: box2d.b2Fixture | null | any = null; // HACK: tsc doesn't detect calling callbacks

    // Query the world for overlapping shapes.
    this.m_world.QueryPointAABB(null, p, (fixture: box2d.b2Fixture): boolean => {
      const body = fixture.GetBody();
      if (body.GetType() === box2d.b2BodyType.b2_dynamicBody) {
        const inside = fixture.TestPoint(p);
        if (inside) {
          hit_fixture = fixture;
          return false; // We are done, terminate the query.
        }
      }
      return true; // Continue the query.
    });

    if (hit_fixture) {
      const body = hit_fixture.GetBody();
      const md: box2d.b2MouseJointDef = new box2d.b2MouseJointDef();
      md.bodyA = this.m_groundBody;
      md.bodyB = body;
      md.target.Copy(p);
      md.maxForce = 1000 * body.GetMass();
      this.m_mouseJoint = this.m_world.CreateJoint(md) as box2d.b2MouseJoint;
      body.SetAwake(true);
    }
  }

  public MouseUp(p: box2d.b2Vec2): void {
    if (this.m_mouseJoint) {
      this.m_world.DestroyJoint(this.m_mouseJoint);
      this.m_mouseJoint = null;
    }
  }

  public MouseMove(p: box2d.b2Vec2): void {
    this.m_mouseWorld.Copy(p);

    if (this.m_mouseJoint) {
      this.m_mouseJoint.SetTarget(p);
    }
  }

  public GetDefaultViewZoom(): number {
    return 1.0;
  }
}
