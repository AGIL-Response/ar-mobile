import type RoomMember from '../../models/RoomMember';
import type { ChatUser } from '../../../types';

/**
 * Convert ChatUser to WatermelonDB RoomMember model data
 */
export function chatUserToRoomMemberData(memberData: ChatUser, roomId: string): {
  roomId: string;
  userId: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: number;
} {
  const userId = typeof memberData.id === 'string' ? memberData.id : String(memberData.id);
  const validRoomId = typeof roomId === 'string' ? roomId : String(roomId);

  return {
    roomId: validRoomId,
    userId,
    username: memberData.username,
    displayName: memberData.displayName,
    avatarUrl: memberData.avatarUrl,
    status: memberData.status,
    lastSeen: memberData.lastSeen ? memberData.lastSeen.getTime() : undefined,
  };
}

/**
 * Convert WatermelonDB RoomMember to ChatUser
 */
export function roomMemberToChatUser(member: RoomMember): ChatUser {
  return {
    id: member.userId,
    username: member.username,
    displayName: member.displayName,
    avatarUrl: member.avatarUrl,
    status: member.status,
    lastSeen: member.lastSeen ? new Date(member.lastSeen) : undefined,
  };
}

