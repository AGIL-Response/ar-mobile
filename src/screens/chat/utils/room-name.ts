/**
 * Room name utilities
 * Single Responsibility: Generate display names for rooms
 */

import type { ChatRoom } from '@/services/chat';

/**
 * Get display name for a room
 */
export function getRoomDisplayName(room: ChatRoom | null): string {
  if (!room) return 'Chat';
  
  if (room.type === 'dm' && room.members.length > 0) {
    const otherMember = room.members.find((m) => m.id !== room.members[0]?.id);
    return otherMember?.displayName || otherMember?.username || 'Chat';
  }
  
  return room.name || 'Chat';
}

