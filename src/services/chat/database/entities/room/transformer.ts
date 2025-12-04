import type Room from '../../models/Room';
import type Message from '../../models/Message';
import type { ChatRoom, ChatMessage } from '../../../types';

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
    const possibleIdFields = ['id', '_id', 'uuid', 'uid'];
    for (const key of possibleIdFields) {
      if (key in value && typeof value[key] === 'string') {
        return value[key];
      }
    }
    
    if (typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue !== '[object Object]' && stringValue !== '') {
        return stringValue;
      }
    }
    
    try {
      const stringified = JSON.stringify(value);
      if (stringified && stringified !== 'null' && stringified !== 'undefined' && stringified.length < 200) {
        console.warn(`Converted object to string ID for ${fieldName} using JSON.stringify:`, value);
        return stringified;
      }
    } catch (e) {
      // JSON.stringify failed
    }
    
    console.error(`Cannot convert object to string ID for ${fieldName}:`, value);
    throw new Error(`${fieldName} is an object that cannot be converted to a string ID: ${JSON.stringify(value)}`);
  }
  
  const stringValue = String(value);
  if (stringValue === '[object Object]' || stringValue === 'undefined' || stringValue === 'null') {
    throw new Error(`${fieldName} cannot be converted to a valid string ID (got: ${typeof value})`);
  }
  return stringValue;
}

/**
 * Convert ChatRoom to WatermelonDB Room model data
 */
export function chatRoomToRoomData(roomData: ChatRoom): {
  roomId: string;
  name: string;
  description?: string;
  type: 'direct' | 'group';
  avatarUrl?: string;
  isPrivate: boolean;
  unreadCount: number;
  lastMessageId?: string;
  lastMessageAt?: number;
  serverCreatedAt?: string;
  serverUpdatedAt?: string;
} {
  let roomId: string;
  if (typeof roomData.id === 'string') {
    roomId = roomData.id;
  } else if (typeof roomData.id === 'number') {
    roomId = String(roomData.id);
  } else if (roomData.id && typeof roomData.id === 'object' && 'id' in roomData.id) {
    roomId = String((roomData.id as any).id);
  } else if (roomData.id && typeof roomData.id === 'object') {
    console.warn('Room ID is an object, attempting to extract ID:', roomData.id);
    roomId = JSON.stringify(roomData.id);
  } else {
    roomId = String(roomData.id);
  }
  
  if (!roomId || roomId === 'undefined' || roomId === 'null' || roomId === '[object Object]' || roomId.trim() === '') {
    throw new Error(`Invalid room ID: ${roomId} (original: ${JSON.stringify(roomData.id)})`);
  }

  const createdAt = roomData.createdAt instanceof Date
    ? roomData.createdAt
    : roomData.createdAt
      ? new Date(roomData.createdAt)
      : new Date();
  
  const updatedAt = roomData.updatedAt instanceof Date
    ? roomData.updatedAt
    : roomData.updatedAt
      ? new Date(roomData.updatedAt)
      : new Date();

  return {
    roomId,
    name: roomData.name,
    description: roomData.description,
    type: roomData.type,
    avatarUrl: roomData.avatar,
    isPrivate: roomData.isPrivate ?? false,
    unreadCount: roomData.unreadCount,
    lastMessageId: roomData.lastMessage
      ? (typeof roomData.lastMessage.id === 'string'
          ? roomData.lastMessage.id
          : String(roomData.lastMessage.id))
      : undefined,
    lastMessageAt: roomData.lastMessage
      ? roomData.lastMessage.timestamp.getTime()
      : undefined,
    serverCreatedAt: createdAt.toISOString(),
    serverUpdatedAt: updatedAt.toISOString(),
  };
}

/**
 * Convert WatermelonDB Room to ChatRoom
 * Note: This requires async operations to fetch related data, so it's in the operator file
 */
export type RoomToChatRoomContext = {
  members: Array<{
    id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    status?: 'online' | 'away' | 'offline';
    lastSeen?: Date;
  }>;
  lastMessage?: ChatMessage;
  currentUserId?: string;
};

