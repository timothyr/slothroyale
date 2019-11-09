import { b2Fixture, b2WorldManifold, b2Atan2, b2Vec2, b2Contact } from '@flyover/box2d';
import { PlayerMovement } from './Player';
import { MoveX } from '@game/core/InputTypes';
import { UserData, ObjectType } from '@game/object/UserData';

/**
 * Apply player movement forces on contact
 * @param contact Contact reference
 * @param fixtureA Fixture A in the contact
 * @param fixtureB Fixture B in the contact
 * @param userDataA User Data of Fixture A
 * @param userDataB User Data of Fixture B
 */
export const playerPreSolve = (contact: b2Contact, fixtureA: b2Fixture, fixtureB: b2Fixture, userDataA: UserData, userDataB: UserData) => {

  let playerMovementA: PlayerMovement = null;
  let playerMovementB: PlayerMovement = null;

  if (userDataA && userDataA.objectType === ObjectType.PLAYER) {
    playerMovementA = userDataA as PlayerMovement;
  }

  if (userDataB && userDataB.objectType === ObjectType.PLAYER) {
    playerMovementB = userDataB as PlayerMovement;
  }

  const worldManifold: b2WorldManifold = new b2WorldManifold();
  contact.GetWorldManifold(worldManifold);

  let surfaceVelocityModifier = 0;

  const getForce = (playerMovement: PlayerMovement, localNormal: b2Vec2) => {
    const angle = b2Atan2(localNormal.y, localNormal.x);
    // Only move if the hill isn't too steep
    if (playerMovement.minAngle < angle && angle < playerMovement.maxAngle
      // Let the player move down any hill
      || playerMovement.moveX === MoveX.RIGHT && playerMovement.minAngle > angle
      || playerMovement.moveX === MoveX.LEFT && angle > playerMovement.maxAngle) {
      // Add velocity
      surfaceVelocityModifier += playerMovement.velocity;
    }
  };

  if (playerMovementA) {
    const localNormal = fixtureA.GetBody().GetLocalVector(worldManifold.normal, new b2Vec2());
    getForce(playerMovementA, localNormal);
  }

  if (playerMovementB) {
    const negWorldNormal = new b2Vec2(-worldManifold.normal.x, -worldManifold.normal.y);
    const localNormal = fixtureB.GetBody().GetLocalVector(negWorldNormal, new b2Vec2());
    getForce(playerMovementB, localNormal);
  }

  contact.SetTangentSpeed(surfaceVelocityModifier);
};

/**
 * Increase counter for foot contacts when player begins contact with an object
 * @param contact Contact reference
 * @param fixtureA Fixture A in the contact
 * @param fixtureB Fixture B in the contact
 * @param userDataA User Data of Fixture A
 * @param userDataB User Data of Fixture B
 */
export const playerBeginContact = (contact: b2Contact,
                                   fixtureA: b2Fixture, fixtureB: b2Fixture,
                                   userDataA: UserData, userDataB: UserData): number => {

  let playerMovementA: PlayerMovement = null;
  let playerMovementB: PlayerMovement = null;

  if (userDataA && userDataA.objectType === ObjectType.PLAYER) {
    playerMovementA = userDataA as PlayerMovement;
  }

  if (userDataB && userDataB.objectType === ObjectType.PLAYER) {
    playerMovementB = userDataB as PlayerMovement;
  }

  let contactCount = 0;

  if (playerMovementA) {
    contactCount++;
  }

  if (playerMovementB) {
    contactCount++;
  }

  return contactCount;
};

/**
 * Decrease counter for foot contacts when player ends contact with an object
 * @param contact Contact reference
 * @param fixtureA Fixture A in the contact
 * @param fixtureB Fixture B in the contact
 * @param userDataA User Data of Fixture A
 * @param userDataB User Data of Fixture B
 */
export const playerEndContact = (contact: b2Contact,
                                 fixtureA: b2Fixture, fixtureB: b2Fixture,
                                 userDataA: UserData, userDataB: UserData): number => {

  let playerMovementA: PlayerMovement = null;
  let playerMovementB: PlayerMovement = null;

  if (userDataA && userDataA.objectType === ObjectType.PLAYER) {
    playerMovementA = userDataA as PlayerMovement;
  }

  if (userDataB && userDataB.objectType === ObjectType.PLAYER) {
    playerMovementB = userDataB as PlayerMovement;
  }

  let contactCount = 0;

  if (playerMovementA) {
    contactCount--;
  }

  if (playerMovementB) {
    contactCount--;
  }

  return contactCount;
};
