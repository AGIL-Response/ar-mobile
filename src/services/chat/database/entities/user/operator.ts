import { getDatabase } from '../../index';
import type User from '../../models/User';
import type { ChatUser } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { chatUserToUserData, userToChatUser } from './transformer';

const db = getDatabase();

/**
 * Upsert a user (create or update)
 */
export async function upsertUser(userData: ChatUser): Promise<User> {
  const userDataTransformed = chatUserToUserData(userData);
  const userId = userDataTransformed.userId;

  console.log('💾 [UserOperator] Upserting user:', {
    userId,
    username: userData.username,
    displayName: userData.displayName,
    avatarUrl: userData.avatarUrl,
  });

  // Check if user exists
  const existingUsers = await db
    .get<User>('users')
    .query(Q.where('user_id', userId))
    .fetch();

  const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;

  if (existingUser) {
    console.log('🔄 [UserOperator] Updating existing user:', userId);
    return await db.write(async () => {
      await existingUser.update((user) => {
        user.username = userDataTransformed.username;
        user.email = userDataTransformed.email;
        user.displayName = userDataTransformed.displayName;
        user.avatarUrl = userDataTransformed.avatarUrl;
        user.status = userDataTransformed.status;
        if (userDataTransformed.lastSeen !== undefined) {
          user.lastSeen = userDataTransformed.lastSeen;
        }
      });
      return existingUser;
    });
  } else {
    console.log('➕ [UserOperator] Creating new user:', userId);
    return await db.write(async () => {
      const newUser = await db.get<User>('users').create((user) => {
        user.userId = userDataTransformed.userId;
        user.username = userDataTransformed.username;
        user.email = userDataTransformed.email;
        user.displayName = userDataTransformed.displayName;
        user.avatarUrl = userDataTransformed.avatarUrl;
        user.status = userDataTransformed.status;
        if (userDataTransformed.lastSeen !== undefined) {
          user.lastSeen = userDataTransformed.lastSeen;
        }
      });
      console.log('✅ [UserOperator] User created successfully:', userId);
      return newUser;
    });
  }
}

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<ChatUser | null> {
  const users = await db
    .get<User>('users')
    .query(Q.where('user_id', userId))
    .fetch();

  if (users.length === 0) {
    return null;
  }

  return userToChatUser(users[0]);
}

/**
 * Get multiple users by IDs
 */
export async function getUsers(userIds: string[]): Promise<ChatUser[]> {
  if (userIds.length === 0) {
    return [];
  }

  const users = await db
    .get<User>('users')
    .query(Q.where('user_id', Q.oneOf(userIds)))
    .fetch();

  return users.map(userToChatUser);
}

