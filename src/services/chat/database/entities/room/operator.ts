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
 * Deduplicates rooms by room_id to ensure only unique rooms are returned
 */
export function observeRooms(roomToChatRoomFn: (room: Room) => Promise<ChatRoom>) {
  return db.get<Room>('rooms').query(Q.sortBy('last_message_at', Q.desc)).observe().pipe(
    switchMap((rooms) => {
      // Deduplicate rooms by room_id (keep the first occurrence of each unique room_id)
      // This handles cases where duplicate rooms might exist in the database
      const roomMap = new Map<string, Room>();
      for (const room of rooms) {
        if (!roomMap.has(room.roomId)) {
          roomMap.set(room.roomId, room);
        }
      }

      // Convert to array and maintain sort order by last_message_at
      const uniqueRooms = Array.from(roomMap.values()).sort((a, b) => {
        const timeA = a.lastMessageAt || 0;
        const timeB = b.lastMessageAt || 0;
        return timeB - timeA; // Descending order (newest first)
      });

      return Promise.all(uniqueRooms.map((room) => roomToChatRoomFn(room)));
    }),
    distinctUntilChanged((prev, curr) => {
      // Compare room IDs, order, and members to prevent redundant emissions
      // But allow emissions when members change (important for DM room avatars)
      if (prev.length !== curr.length) return false;
      
      // Check if any room has different members (by comparing member IDs)
      const hasMemberChanges = prev.some((prevRoom, index) => {
        const currRoom = curr[index];
        if (!currRoom || prevRoom.id !== currRoom.id) return true;
        
        // Compare members - if members length or member IDs differ, consider it changed
        const prevMemberIds = prevRoom.members?.map(m => m.id).sort().join(',') || '';
        const currMemberIds = currRoom.members?.map(m => m.id).sort().join(',') || '';
        if (prevMemberIds !== currMemberIds) return true;
        
        // Also check if any member's avatarUrl changed (important for DM avatars)
        if (prevRoom.members?.length !== currRoom.members?.length) return true;
        if (prevRoom.members && currRoom.members) {
          for (let i = 0; i < prevRoom.members.length; i++) {
            if (prevRoom.members[i]?.avatarUrl !== currRoom.members[i]?.avatarUrl) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      // If members changed, allow emission
      if (hasMemberChanges) return false;
      
      // Otherwise, only emit if room IDs or order changed
      return prev.every((room, index) => room.id === curr[index]?.id);
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

