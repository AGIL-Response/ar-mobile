/**
 * Room avatar utilities
 * Single Responsibility: Get avatar information for rooms
 */

import type { ChatRoom } from '@/services/chat';

/**
 * Get avatar URL for a room member
 * Priority: avatar.thumbnail > avatar.url > avatar.id > avatarUrl (deprecated)
 */
function getMemberAvatarUrl(member: ChatRoom['members'][0]): string | undefined {
  if (member.avatar) {
    // Prefer thumbnail for better performance, fallback to url, then id
    return member.avatar.thumbnail || member.avatar.url || member.avatar.id;
  }
  // Fallback to deprecated avatarUrl
  return member.avatarUrl;
}

/**
 * Get avatar URL for a room
 */
export function getRoomAvatarUrl(room: ChatRoom, currentUsername?: string): string | undefined {
  if (room.type === 'dm') {
    // For DM rooms, we need to find the other member's avatar
    // Handle case where members might not be loaded yet (race condition on initial load)
    if (!room.members || room.members.length === 0) {
      // If members aren't loaded yet, return undefined (will use fallback)
      return undefined;
    }
    
    if (currentUsername) {
      // Find the member that is NOT the current user
      const otherMember = room.members.find(
        (m) => m.username !== currentUsername
      );
      return otherMember ? getMemberAvatarUrl(otherMember) : undefined;
    }
    
    // Fallback: if no currentUsername, use the first member that's not the first one
    // For DM rooms with 2 members, find the one that's not the first
    if (room.members.length >= 2) {
      const otherMember = room.members.find(
        (m) => m.id !== room.members[0]?.id
      );
      return otherMember ? getMemberAvatarUrl(otherMember) : undefined;
    }
    
    // If only one member (shouldn't happen in DM, but handle gracefully)
    return room.members[0] ? getMemberAvatarUrl(room.members[0]) : undefined;
  }
  
  // For group rooms, use the room's avatar
  return room.avatar;
}

