import { getDatabase } from '../../index';
import type Room from '../../models/Room';
import type Message from '../../models/Message';
import type { ChatRoom } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { switchMap, of } from 'rxjs';
import { chatRoomToRoomData, type RoomToChatRoomContext } from './transformer';
import type { ChatMessage } from '../../../types';

const db = getDatabase();

/**
 * Upsert a room (create or update)
 */
export async function upsertRoom(roomData: ChatRoom): Promise<Room> {
  const roomDataTransformed = chatRoomToRoomData(roomData);
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

  if (room.lastMessageId && getLastMessageFn) {
    lastMessage = await getLastMessageFn(room.lastMessageId);
  }

  // For DM rooms, set the room name to the opposite member's name
  let roomName = room.name;

  console.log('🔍 [roomToChatRoom] Room name:', roomName, 'Room type:', room.type, 'Current user ID:', context.currentUserId, 'Members:', context.members.length);
  if (room.type === 'dm' && context.currentUserId && context.members.length > 0) {
    // Find the opposite member (not the current user)
    const oppositeMember = context.members.find((member) => member.id !== context.currentUserId);
    if (oppositeMember) {
      roomName = oppositeMember.displayName || oppositeMember.username || room.name;
    }
    console.log('🔍 [roomToChatRoom] Opposite member:', oppositeMember);
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
    unreadCount: room.unreadCount,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

/**
 * Get observable for all rooms
 */
export function observeRooms(roomToChatRoomFn: (room: Room) => Promise<ChatRoom>) {
  return db.get<Room>('rooms').query().observe().pipe(
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

