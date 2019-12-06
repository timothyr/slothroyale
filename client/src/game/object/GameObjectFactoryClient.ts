import { GameObjectFactory } from 'gamecommon/game/object/GameObjectFactory';
import { b2World, b2Vec2 } from 'gamecommon/node_modules/@flyover/box2d';
import { GrenadeGraphics } from '@game/weapon/GrenadeGraphics';
import { GroundGraphics } from './GroundGraphics';
import { PlayerGraphics } from '@game/player/PlayerGraphics';
import { Ground } from 'gamecommon/game/object/Ground';

export class GameObjectFactoryClient extends GameObjectFactory {
  public createGround(world: b2World, position: b2Vec2, bodyParams: any): GroundGraphics {
    return new GroundGraphics(world, position, bodyParams);
  }

  public createGroundFromServer(world: b2World, groundSchema: Ground): GroundGraphics {
    return GroundGraphics.CreateGroundFromServer(world, groundSchema, groundSchema.localUUID);
  }

  public createPlayer(world: b2World, position: b2Vec2): PlayerGraphics {
    return new PlayerGraphics(world, position);
  }

  public createGrenade(world: b2World, position: b2Vec2, aimAngle: number, direction: number): GrenadeGraphics {
    return new GrenadeGraphics(world, position, aimAngle, direction);
  }
}
