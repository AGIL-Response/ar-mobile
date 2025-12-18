/**
 * Custom hook for room data management
 * Single Responsibility: Manage room data loading and observables
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useObservable } from '@/lib/hooks/use-observable';
import { chatService } from '@/services/chat';
import type { ChatRoom } from '@/services/chat';

interface UseRoomDataParams {
  roomId: string | undefined;
}

interface UseRoomDataReturn {
  room: ChatRoom | null;
  isLoading: boolean;
}

/**
 * Hook to manage room data loading and observables
 */
export function useRoomData({ roomId }: UseRoomDataParams): UseRoomDataReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Memoize room observable to prevent recreation on every render
  const observableRoom = useMemo(() => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return null;
    }
    try {
      return chatService.observeRoom(roomId);
    } catch (error) {
      console.error('Error creating room observable:', error, { roomId });
      return null;
    }
  }, [roomId]);

  const room = useObservable(observableRoom, null);

  useEffect(() => {
    if (!roomId) {
      router.back();
      return;
    }

    const loadRoomData = async () => {
      try {
        setIsLoading(true);

        // Get room details to ensure room exists in DB
        chatService.getSocketService().getConversationDetails(roomId);

        // Load initial messages - they will be inserted into DB and observable will update
        chatService.getSocketService().loadHistory(roomId, 50);

        // Join room via socket
        chatService.getSocketService().joinRoom(roomId);

        // Mark as read
        await chatService.markAsRead(roomId);
      } catch (error) {
        console.error('❌ [RoomScreen] Failed to load room data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();

    return () => {
      // Leave room on unmount
      if (roomId) {
        chatService.getSocketService().leaveRoom(roomId);
      }
    };
  }, [roomId, router]);

  return { room, isLoading };
}

