/**
 * Custom hook for room card logic
 * Single Responsibility: Provide room card data and handlers
 */

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import type { ChatRoom } from '@/services/chat';
import { getRoomDisplayName } from '../utils/room-name';
import { getRoomAvatarUrl } from '../utils/room-avatar';
import { formatRelativeTime } from '../utils/time-formatters';
import { getLastMessagePreview } from '../utils/last-message-preview';

interface UseRoomCardReturn {
  roomName: string;
  roomAvatarUrl: string | undefined;
  lastMessagePreview: string;
  formattedTime: string;
  handlePress: () => void;
}

/**
 * Hook to provide room card data and handlers
 */
export function useRoomCard(
  room: ChatRoom,
  onPress?: (room: ChatRoom) => void
): UseRoomCardReturn {
  const currentUsername = useAuthStore((state) => state.user?.username);

  const roomName = useMemo(() => getRoomDisplayName(room), [room]);
  
  const roomAvatarUrl = useMemo(
    () => getRoomAvatarUrl(room, currentUsername),
    [room, currentUsername]
  );

  const lastMessagePreview = useMemo(
    () => getLastMessagePreview(room.lastMessage),
    [room.lastMessage]
  );

  const formattedTime = useMemo(() => {
    const timestamp = room.lastMessageAt || room.lastMessage?.timestamp;
    return formatRelativeTime(timestamp);
  }, [room.lastMessageAt, room.lastMessage?.timestamp]);

  const handlePress = () => {
    onPress?.(room);
  };

  return {
    roomName,
    roomAvatarUrl,
    lastMessagePreview,
    formattedTime,
    handlePress,
  };
}

