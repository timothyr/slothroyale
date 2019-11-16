import { b2Fixture, b2Contact } from '@flyover/box2d';
import { UserData, ObjectType } from '../object/UserData';

/**
 * Return list of projectiles that have collided with something
 * @param contact Contact reference
 * @param fixtureA Fixture A in the contact
 * @param fixtureB Fixture B in the contact
 * @param userDataA User Data of Fixture A
 * @param userDataB User Data of Fixture B
 */
export const projectileBeginContact = (contact: b2Contact, fixtureA: b2Fixture, fixtureB: b2Fixture, userDataA: UserData, userDataB: UserData): UserData[] => {

  const projectileUserDataToDestroy: UserData[] = [];

  if (userDataA && userDataA.objectType === ObjectType.PROJECTILE) {
    projectileUserDataToDestroy.push(userDataA);
  }

  if (userDataB && userDataB.objectType === ObjectType.PROJECTILE) {
    projectileUserDataToDestroy.push(userDataB);
  }

  return projectileUserDataToDestroy;
};
