import { GameObject } from "./GameObject";
import { Grenade } from '../weapon/Grenade';
import { b2World, b2Vec2 } from '@flyover/box2d';
import { Ground } from './Ground';
import { Player } from '../player/Player';
import { ObjectType } from './UserData';

export abstract class GameObjectFactory {
  public abstract createGround(world: b2World, position: b2Vec2, bodyParams: any): Ground;
  public abstract createPlayer(world: b2World, position: b2Vec2): Player;
  public abstract createGrenade(world: b2World, position: b2Vec2, aimAngle: number, direction: number): Grenade;
}

export class GameObjectFactoryServer extends GameObjectFactory {
  public createGround(world: b2World, position: b2Vec2, bodyParams: any): Ground {
    return new Ground(world, position, bodyParams);
  }

  public createPlayer(world: b2World, position: b2Vec2): Player {
    return new Player(world, position);
  }
  
  public createGrenade(world: b2World, position: b2Vec2, aimAngle: number, direction: number): Grenade {
    return new Grenade(world, position, aimAngle, direction);
  }
}