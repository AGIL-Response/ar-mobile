import type User from '../../models/User';
import type { ChatUser } from '../../../types';

/**
 * Safely convert a value to a string ID
 */
function ensureStringId(value: any, fieldName: string = 'id'): string {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is null or undefined`);
  }
  
  if (typeof value === 'string') {
    if (value.trim() === '' || value === '[object Object]' || value === 'undefined' || value === 'null') {
      throw new Error(`Invalid string ID for ${fieldName}: '${value}'`);
    }
    return value;
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    // Try to extract an ID field from the object
    const possibleIdFields = ['id', '_id', 'uuid', 'uid'];
    for (const key of possibleIdFields) {
      if (key in value && typeof value[key] === 'string') {
        return value[key];
      }
    }
    
    // If it has a toString method that returns something useful, use it
    if (typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue !== '[object Object]' && stringValue !== '') {
        return stringValue;
      }
    }
    
    // Last resort: try JSON.stringify, but this is not ideal for IDs
    try {
      const stringified = JSON.stringify(value);
      if (stringified && stringified !== 'null' && stringified !== 'undefined' && stringified.length < 200) {
        console.warn(`Converted object to string ID for ${fieldName} using JSON.stringify:`, value);
        return stringified;
      }
    } catch (e) {
      // JSON.stringify failed (circular reference, etc.)
    }
    
    // If we get here, we couldn't convert the object to a valid string ID
    console.error(`Cannot convert object to string ID for ${fieldName}:`, value);
    throw new Error(`${fieldName} is an object that cannot be converted to a string ID: ${JSON.stringify(value)}`);
  }
  
  // For any other type, try String() conversion
  const stringValue = String(value);
  if (stringValue === '[object Object]' || stringValue === 'undefined' || stringValue === 'null') {
    throw new Error(`${fieldName} cannot be converted to a valid string ID (got: ${typeof value})`);
  }
  return stringValue;
}

/**
 * Convert ChatUser to WatermelonDB User model data
 */
export function chatUserToUserData(userData: ChatUser): {
  userId: string;
  username?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: number;
} {
  const userId = ensureStringId(userData.id, 'user.id');
  
  if (!userId || userId === 'undefined' || userId === 'null' || userId === '[object Object]' || userId.trim() === '') {
    throw new Error(`Invalid user ID: ${userId} (original: ${JSON.stringify(userData.id)})`);
  }

  return {
    userId,
    username: userData.username,
    email: userData.email,
    displayName: userData.displayName,
    avatarUrl: userData.avatarUrl,
    status: userData.status,
    lastSeen: userData.lastSeen ? userData.lastSeen.getTime() : undefined,
  };
}

/**
 * Convert WatermelonDB User to ChatUser
 */
export function userToChatUser(user: User): ChatUser {
  return {
    id: user.userId,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    status: user.status,
    lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined,
  };
}

