/**
 * Custom hook for messages management
 * Single Responsibility: Manage messages observables and processing
 */

import { useMemo, useRef } from 'react';
import { useObservable } from '@/lib/hooks/use-observable';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/services/chat';
import { processMessagesForDisplay } from '../utils/message-processor';

interface UseMessagesParams {
  roomId: string | undefined;
}

interface UseMessagesReturn {
  messages: ChatMessage[];
  messagesRef: React.MutableRefObject<ChatMessage[]>;
}

/**
 * Hook to manage messages observables and processing
 */
export function useMessages({ roomId }: UseMessagesParams): UseMessagesReturn {
  const messagesRef = useRef<ChatMessage[]>([]);

  // Memoize messages observable to prevent recreation on every render
  const observableMessages = useMemo(() => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return null;
    }
    try {
      // Observe ALL messages for the room (no limit) - sorted by created_at ascending
      // The observable will automatically update when new messages are inserted into DB
      return chatService.observeMessages(roomId);
    } catch (error) {
      console.error('❌ [RoomScreen] Error creating messages observable:', error, { roomId });
      return null;
    }
  }, [roomId]);

  const messagesObservableResult = useObservable(observableMessages, []);

  // Process messages for display: deduplicate and reverse
  // Messages come from DB sorted descending (newest first, oldest last): [newest, ..., oldest]
  // After reversal: [oldest, ..., newest] - with alignItemsAtEnd, newest (last items) align to bottom
  // Stable reference: only create new array when messagesObservableResult reference changes
  const messages = useMemo(() => {
    if (!messagesObservableResult || messagesObservableResult.length === 0) {
      messagesRef.current = [];
      return [];
    }

    const processed = processMessagesForDisplay(messagesObservableResult);
    messagesRef.current = processed;
    return processed;
  }, [messagesObservableResult]);

  return { messages, messagesRef };
}

