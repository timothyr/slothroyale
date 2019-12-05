import { Input } from './InputTypes';
import {
  b2DestructionListener, b2Joint, b2Fixture, b2Vec2, b2PointState, b2ContactListener, b2World,
  b2BodyDef, b2MouseJoint, b2Body, b2BodyType, b2MouseJointDef
} from '@flyover/box2d';
import { World } from '../schema/World';

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
    if (this.map.mapMouseJoint === joint) {
      this.map.mapMouseJoint = null;
    } else {
      this.map.JointDestroyed(joint);
    }
  }

  public SayGoodbyeFixture(fixture: b2Fixture): void { }
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

export class MapBase extends World {

  constructor() {
    super();

    const gravity: b2Vec2 = new b2Vec2(0, -12);
    this.world = new b2World(gravity);

    this.mapMouseJoint = null;

    this.mapDestructionListener = new DestructionListener(this);
    this.world.SetDestructionListener(this.mapDestructionListener);
    this.world.SetContactListener(b2ContactListener.b2_defaultListener);
    // this.m_world.SetDebugDraw(g_debugDraw);

    const bodyDef: b2BodyDef = new b2BodyDef();
    this.mapGroundBody = this.world.CreateBody(bodyDef);
  }

  public world: b2World;

  // Mouse
  public mapMouseJoint: b2MouseJoint | null = null;
  public readonly mapMouseWorld: b2Vec2 = new b2Vec2();
  public mapDestructionListener: DestructionListener;
  public mapGroundBody: b2Body;


  // ---------- Step ------------

  public Step(settings: Settings, input: Input): void {
    const timeStep = settings.hz > 0 ? 1 / settings.hz : 0;

    this.world.SetAllowSleeping(settings.enableSleep);
    this.world.SetWarmStarting(settings.enableWarmStarting);
    this.world.SetContinuousPhysics(settings.enableContinuous);
    this.world.SetSubStepping(settings.enableSubStepping);

    this.world.Step(timeStep, settings.velocityIterations, settings.positionIterations);
  }

  // ---------- Joints ----------

  public JointDestroyed(joint: b2Joint): void { }

  // ---------- Mouse -----------

  public MouseDown(p: b2Vec2): boolean {
    this.mapMouseWorld.Copy(p);

    if (this.mapMouseJoint !== null) {
      this.world.DestroyJoint(this.mapMouseJoint);
      this.mapMouseJoint = null;
    }

    let hitFixture: b2Fixture | null | any = null; // HACK: tsc doesn't detect calling callbacks

    // Query the world for overlapping shapes.
    this.world.QueryPointAABB(null, p, (fixture: b2Fixture): boolean => {
      const body = fixture.GetBody();
      if (body.GetType() === b2BodyType.b2_dynamicBody) {
        const inside = fixture.TestPoint(p);
        if (inside) {
          hitFixture = fixture;
          // console.log("hit");

          return false; // We are done, terminate the query.
        }
      }
      return true; // Continue the query.
    });

    if (hitFixture) {
      const body = hitFixture.GetBody();
      const md: b2MouseJointDef = new b2MouseJointDef();
      md.bodyA = this.mapGroundBody;
      md.bodyB = body;
      md.target.Copy(p);
      md.maxForce = 1000 * body.GetMass();
      this.mapMouseJoint = this.world.CreateJoint(md) as b2MouseJoint;
      body.SetAwake(true);
    }

    return hitFixture;
  }

  public MouseUp(p: b2Vec2): void {
    if (this.mapMouseJoint) {
      this.world.DestroyJoint(this.mapMouseJoint);
      this.mapMouseJoint = null;
    }
  }

  public MouseMove(p: b2Vec2): void {
    this.mapMouseWorld.Copy(p);

    if (this.mapMouseJoint) {
      this.mapMouseJoint.SetTarget(p);
    }
  }

  public GetDefaultViewZoom(): number {
    return 1.0;
  }
}
