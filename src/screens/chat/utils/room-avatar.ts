/**
 * Room avatar utilities
 * Single Responsibility: Get avatar information for rooms
 */

import type { ChatRoom } from '@/services/chat';

/**
 * Get avatar URL for a room
 */
export function getRoomAvatarUrl(room: ChatRoom, currentUsername?: string): string | undefined {
  if (room.type === 'dm' && room.members.length > 0) {
    if (currentUsername) {
      // Find the member that is NOT the current user
      const otherMember = room.members.find(
        (m) => m.username !== currentUsername
      );
      return otherMember?.avatarUrl;
    }
    // Fallback: if no currentUsername, use the first member that's not the first one
    const otherMember = room.members.find(
      (m) => m.id !== room.members[0]?.id
    );
    return otherMember?.avatarUrl;
  }
  return room.avatar;
}

