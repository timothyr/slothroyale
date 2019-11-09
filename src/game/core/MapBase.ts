import { Input } from './InputTypes';
import { b2DestructionListener, b2Joint, b2Fixture, b2Vec2, b2PointState, b2ContactListener, b2World, b2BodyDef, b2MouseJoint, b2Body, b2MakeArray, b2DrawFlags, b2Color, b2BodyType, b2MouseJointDef } from '@flyover/box2d';

export class Settings {
  public hz = 60;
  public velocityIterations = 8;
  public positionIterations = 3;
  public drawShapes = false;
  public drawJoints = false;
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

export class DestructionListener extends b2DestructionListener {
  public map: MapBase;

  constructor(map: MapBase) {
    super();

    this.map = map;
  }

  public SayGoodbyeJoint(joint: b2Joint): void {
    if (this.map.m_mouseJoint === joint) {
      this.map.m_mouseJoint = null;
    } else {
      this.map.JointDestroyed(joint);
    }
  }

  public SayGoodbyeFixture(fixture: b2Fixture): void {}
}

/**
 * Contact Point (debug draw collisions)
 */
export class ContactPoint {
  public fixtureA!: b2Fixture;
  public fixtureB!: b2Fixture;
  public readonly normal: b2Vec2 = new b2Vec2();
  public readonly position: b2Vec2 = new b2Vec2();
  public state: b2PointState = b2PointState.b2_nullState;
  public normalImpulse = 0;
  public tangentImpulse = 0;
  public separation = 0;
}

export class MapBase extends b2ContactListener {

  constructor() {
      super();

      const gravity: b2Vec2 = new b2Vec2(0, -12);
      this.m_world = new b2World(gravity);

      this.m_mouseJoint = null;

      this.m_destructionListener = new DestructionListener(this);
      this.m_world.SetDestructionListener(this.m_destructionListener);
      this.m_world.SetContactListener(this);
      // this.m_world.SetDebugDraw(g_debugDraw);

      const bodyDef: b2BodyDef = new b2BodyDef();
      this.m_groundBody = this.m_world.CreateBody(bodyDef);
  }

  public m_world: b2World;

  // Mouse
  public m_mouseJoint: b2MouseJoint | null = null;
  public readonly m_mouseWorld: b2Vec2 = new b2Vec2();
  public m_stepCount = 0;
  public m_destructionListener: DestructionListener;
  public m_groundBody: b2Body;


  // ---------- Step ------------

  public Step(settings: Settings, input: Input): void {
    const timeStep = settings.hz > 0 ? 1 / settings.hz : 0;

    this.m_world.SetAllowSleeping(settings.enableSleep);
    this.m_world.SetWarmStarting(settings.enableWarmStarting);
    this.m_world.SetContinuousPhysics(settings.enableContinuous);
    this.m_world.SetSubStepping(settings.enableSubStepping);

    this.m_world.Step(timeStep, settings.velocityIterations, settings.positionIterations);

    if (timeStep > 0) {
      ++this.m_stepCount;
    }
  }

  // ---------- Joints ----------

  public JointDestroyed(joint: b2Joint): void {}

  // ---------- Mouse -----------

  public MouseDown(p: b2Vec2): boolean {
    this.m_mouseWorld.Copy(p);

    if (this.m_mouseJoint !== null) {
      this.m_world.DestroyJoint(this.m_mouseJoint);
      this.m_mouseJoint = null;
    }

    let hit_fixture: b2Fixture | null | any = null; // HACK: tsc doesn't detect calling callbacks

    // Query the world for overlapping shapes.
    this.m_world.QueryPointAABB(null, p, (fixture: b2Fixture): boolean => {
      const body = fixture.GetBody();
      if (body.GetType() === b2BodyType.b2_dynamicBody) {
        const inside = fixture.TestPoint(p);
        if (inside) {
          hit_fixture = fixture;
    console.log("hit");

          return false; // We are done, terminate the query.
        }
      }
      return true; // Continue the query.
    });

    if (hit_fixture) {
      const body = hit_fixture.GetBody();
      const md: b2MouseJointDef = new b2MouseJointDef();
      md.bodyA = this.m_groundBody;
      md.bodyB = body;
      md.target.Copy(p);
      md.maxForce = 1000 * body.GetMass();
      this.m_mouseJoint = this.m_world.CreateJoint(md) as b2MouseJoint;
      body.SetAwake(true);
    }

    return hit_fixture;
  }

  public MouseUp(p: b2Vec2): void {
    if (this.m_mouseJoint) {
      this.m_world.DestroyJoint(this.m_mouseJoint);
      this.m_mouseJoint = null;
    }
  }

  public MouseMove(p: b2Vec2): void {
    this.m_mouseWorld.Copy(p);

    if (this.m_mouseJoint) {
      this.m_mouseJoint.SetTarget(p);
    }
  }

  public GetDefaultViewZoom(): number {
    return 1.0;
  }
}
