import { getDatabase } from '../../index';
import type Room from '../../models/Room';
import type { ChatRoom, ChatMessage } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { switchMap, of, distinctUntilChanged } from 'rxjs';
import { chatRoomToRoomData, type RoomToChatRoomContext } from './transformer';

const db = getDatabase();

/**
 * Upsert a room (create or update)
 */
export async function upsertRoom(roomData: ChatRoom, lastMessageAtOverride?: number | string | Date): Promise<Room> {
  const roomDataTransformed = chatRoomToRoomData(roomData, lastMessageAtOverride);
  const roomId = roomDataTransformed.roomId;

  // Check if room exists
  const existingRooms = await db
    .get<Room>('rooms')
    .query(Q.where('room_id', roomId))
    .fetch();

  const existingRoom = existingRooms.length > 0 ? existingRooms[0] : null;

  if (existingRoom) {
    return await db.write(async () => {
      await existingRoom.update((room) => {
        room.name = roomDataTransformed.name;
        room.description = roomDataTransformed.description;
        room.type = roomDataTransformed.type;
        room.avatarUrl = roomDataTransformed.avatarUrl;
        room.isPrivate = roomDataTransformed.isPrivate;
        room.unreadCount = roomDataTransformed.unreadCount;
        if (roomDataTransformed.lastMessageId) {
          room.lastMessageId = roomDataTransformed.lastMessageId;
        }
        if (roomDataTransformed.lastMessageAt !== undefined) {
          room.lastMessageAt = roomDataTransformed.lastMessageAt;
        }
        room.serverUpdatedAt = roomDataTransformed.serverUpdatedAt;
      });
      return existingRoom;
    });
  } else {
    return await db.write(async () => {
      return await db.get<Room>('rooms').create((room) => {
        room.roomId = roomDataTransformed.roomId;
        room.name = roomDataTransformed.name;
        room.description = roomDataTransformed.description;
        room.type = roomDataTransformed.type;
        room.avatarUrl = roomDataTransformed.avatarUrl;
        room.isPrivate = roomDataTransformed.isPrivate;
        room.unreadCount = roomDataTransformed.unreadCount;
        if (roomDataTransformed.lastMessageId) {
          room.lastMessageId = roomDataTransformed.lastMessageId;
        }
        if (roomDataTransformed.lastMessageAt !== undefined) {
          room.lastMessageAt = roomDataTransformed.lastMessageAt;
        }
        room.serverCreatedAt = roomDataTransformed.serverCreatedAt;
        room.serverUpdatedAt = roomDataTransformed.serverUpdatedAt;
      });
    });
  }
}

/**
 * Convert WatermelonDB Room to ChatRoom
 */
export async function roomToChatRoom(
  room: Room,
  context: RoomToChatRoomContext,
  getLastMessageFn?: (messageId: string) => Promise<ChatMessage | undefined>
): Promise<ChatRoom> {
  let lastMessage: ChatMessage | undefined = undefined;

  // ONLY use lastMessageId from the room (which comes from socket event conversation:list)
  // The lastMessage is already saved when the room is saved from the socket event
  // We should NOT query all messages as a fallback - only use what the server provides
  if (room.lastMessageId && getLastMessageFn) {
    try {
      lastMessage = await getLastMessageFn(room.lastMessageId);
    } catch (error) {
      console.warn('[RoomOperator] Failed to fetch last message by ID:', error, { roomId: room.roomId, lastMessageId: room.lastMessageId });
      // Don't fallback - if we can't get the message by ID, leave it undefined
      // This ensures we only show the lastMessage that the server explicitly provided
    }
  }
  // If lastMessageId is not available, lastMessage remains undefined
  // This is correct - we should only show lastMessage when the server provides it

  // For DM rooms, set the room name to the opposite member's name
  let roomName = room.name;

  if (room.type === 'dm' && context.currentUserId && context.members.length > 0) {
    // Find the opposite member (not the current user)
    const oppositeMember = context.members.find((member) => member.id !== context.currentUserId);
    if (oppositeMember) {
      roomName = oppositeMember.displayName || oppositeMember.username || room.name;
    }
  }

  return {
    id: room.roomId,
    name: roomName,
    description: room.description,
    type: room.type,
    avatar: room.avatarUrl,
    isPrivate: room.isPrivate,
    members: context.members,
    lastMessage,
    lastMessageAt: room.lastMessageAt ? new Date(room.lastMessageAt) : undefined,
    unreadCount: room.unreadCount,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

/**
 * Get observable for all rooms
 */
export function observeRooms(roomToChatRoomFn: (room: Room) => Promise<ChatRoom>) {
  return db.get<Room>('rooms').query(Q.sortBy('last_message_at', Q.desc)).observe().pipe(
    distinctUntilChanged((prev, curr) => {
      // Compare room IDs and order to prevent redundant emissions
      if (prev.length !== curr.length) return false;
      return prev.every((room, index) => room.roomId === curr[index]?.roomId);
    }),
    switchMap((rooms) => {
      return Promise.all(rooms.map((room) => roomToChatRoomFn(room)));
    })
  );
}

/**
 * Get observable for a single room
 */
export function observeRoom(roomId: string, roomToChatRoomFn: (room: Room) => Promise<ChatRoom>) {
  // Validate roomId
  if (roomId === undefined || roomId === null || typeof roomId !== 'string') {
    return of(null);
  }

  const validRoomId = String(roomId).trim();
  if (validRoomId === '' || validRoomId === 'undefined' || validRoomId === 'null' || validRoomId === '[object Object]') {
    return of(null);
  }

  if (!validRoomId || validRoomId.length === 0) {
    return of(null);
  }

  try {
    const query = db
      .get<Room>('rooms')
      .query(Q.where('room_id', validRoomId));

    return query.observe().pipe(
      switchMap((rooms) => {
        if (rooms.length > 0) {
          return roomToChatRoomFn(rooms[0]);
        }
        return Promise.resolve(null);
      })
    );
  } catch (error) {
    console.error('Error creating room observable:', error, { roomId, validRoomId });
    return of(null);
  }
}

/**
 * Get a single room (non-observable)
 */
export async function getRoom(roomId: string, roomToChatRoomFn: (room: Room) => Promise<ChatRoom>): Promise<ChatRoom | null> {
  const rooms = await db
    .get<Room>('rooms')
    .query(Q.where('room_id', roomId))
    .fetch();

  const room = rooms.length > 0 ? rooms[0] : null;
  return room ? roomToChatRoomFn(room) : null;
}

/**
 * Get all rooms (non-observable)
 */
export async function getRooms(roomToChatRoomFn: (room: Room) => Promise<ChatRoom>): Promise<ChatRoom[]> {
  const rooms = await db
    .get<Room>('rooms')
    .query(Q.sortBy('last_message_at', Q.desc))
    .fetch();

  return Promise.all(rooms.map((room) => roomToChatRoomFn(room)));
}

/**
 * Mark room as read (reset unread count)
 */
export async function markRoomAsRead(roomId: string): Promise<void> {
  const rooms = await db
    .get<Room>('rooms')
    .query(Q.where('room_id', roomId))
    .fetch();

  const room = rooms.length > 0 ? rooms[0] : null;

  if (room) {
    await db.write(async () => {
      await room.update((r) => {
        r.unreadCount = 0;
      });
    });
  }
}

/**
 * Update room's last message
 */
export async function updateRoomLastMessage(roomId: string, messageId: string, timestamp: Date): Promise<void> {
  const rooms = await db
    .get<Room>('rooms')
    .query(Q.where('room_id', roomId))
    .fetch();

  const room = rooms.length > 0 ? rooms[0] : null;

  if (room) {
    await db.write(async () => {
      await room.update((r) => {
        r.lastMessageId = messageId;
        r.lastMessageAt = timestamp.getTime();
      });
    });
  }
}

