import { getDatabase } from '../../index';
import type RoomMember from '../../models/RoomMember';
import type Room from '../../models/Room';
import type { ChatUser } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { chatUserToRoomMemberData, roomMemberToChatUser } from './transformer';
import { upsertUser } from '../user/operator';

const db = getDatabase();

/**
 * Upsert room members
 */
export async function upsertRoomMembers(roomId: string, members: ChatUser[]): Promise<void> {
  const validRoomId = typeof roomId === 'string' ? roomId : String(roomId);

  // First, upsert all users to ensure they exist in the users table
  for (const memberData of members) {
    try {
      await upsertUser(memberData);
    } catch (error) {
      console.warn('⚠️ [RoomMemberOperator] Failed to upsert user when saving room member:', error, {
        userId: memberData.id,
        member: memberData,
      });
      // Continue with room member creation even if user upsert fails
    }
  }

  // Delete existing members for this room
  const existingMembers = await db
    .get<RoomMember>('room_members')
    .query(Q.where('room_id', validRoomId))
    .fetch();

  await db.write(async () => {
    for (const member of existingMembers) {
      await member.destroyPermanently();
    }

    for (const memberData of members) {
      const memberDataTransformed = chatUserToRoomMemberData(memberData, validRoomId);
      await db.get<RoomMember>('room_members').create((member) => {
        member.roomId = memberDataTransformed.roomId;
        member.userId = memberDataTransformed.userId;
        member.username = memberDataTransformed.username;
        member.displayName = memberDataTransformed.displayName;
        member.avatarUrl = memberDataTransformed.avatarUrl;
        member.status = memberDataTransformed.status;
        if (memberDataTransformed.lastSeen !== undefined) {
          member.lastSeen = memberDataTransformed.lastSeen;
        }
      });
    }
  });

  // Update room to trigger observable re-emission when members are updated separately
  // (e.g., when members are updated after room is already saved)
  // This ensures the UI updates when members change (especially important for DM room avatars)
  try {
    const rooms = await db
      .get<Room>('rooms')
      .query(Q.where('room_id', validRoomId))
      .fetch();

    if (rooms.length > 0) {
      await db.write(async () => {
        await rooms[0].update((room) => {
          // Update serverUpdatedAt to trigger observable re-emission
          // This ensures the observable detects member changes
          room.serverUpdatedAt = new Date().toISOString();
        });
      });
    }
  } catch (error) {
    // If updating room fails, log but don't throw (members are already saved)
    console.warn('⚠️ [RoomMemberOperator] Failed to update room after saving members:', error);
  }
}

/**
 * Get room members
 */
export async function getRoomMembers(roomId: string): Promise<ChatUser[]> {
  const validRoomId = typeof roomId === 'string' ? roomId : String(roomId);

  const members = await db
    .get<RoomMember>('room_members')
    .query(Q.where('room_id', validRoomId))
    .fetch();

  return members.map(roomMemberToChatUser);
}

