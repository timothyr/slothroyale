import { GameObjectFactory } from 'gamecommon/game/object/GameObjectFactory';
import { b2World, b2Vec2 } from 'gamecommon/node_modules/@flyover/box2d';
import { GrenadeGraphics } from '@game/weapon/GrenadeGraphics';
import { GroundGraphics } from './GroundGraphics';
import { PlayerGraphics } from '@game/player/PlayerGraphics';
import { Ground } from 'gamecommon/game/object/Ground';
import { Player } from 'gamecommon/game/player/Player';

export class GameObjectFactoryClient extends GameObjectFactory {
  public createGround(world: b2World, position: b2Vec2, bodyParams: any): GroundGraphics {
    return new GroundGraphics(world, position, bodyParams);
  }

  public createGroundFromServer(world: b2World, groundSchema: Ground): GroundGraphics {
    return GroundGraphics.CreateGroundFromServer(world, groundSchema, groundSchema.localUUID);
  }

  public createPlayer(world: b2World, position: b2Vec2, name?: string): PlayerGraphics {
    return new PlayerGraphics(world, position, null, name);
  }

  public createPlayerFromServer(world: b2World, playerSchema: Player, sessionId: string): PlayerGraphics {
    return new PlayerGraphics(world, new b2Vec2(playerSchema.x, playerSchema.y), playerSchema.localUUID, playerSchema.name);
  }

  public createGrenade(world: b2World, position: b2Vec2, aimAngle: number, direction: number): GrenadeGraphics {
    return new GrenadeGraphics(world, position, aimAngle, direction);
  }
}
