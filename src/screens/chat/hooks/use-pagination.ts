/**
 * Custom hook for message pagination
 * Single Responsibility: Manage loading more messages (pagination)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/services/chat';

interface UsePaginationParams {
  roomId: string | undefined;
  messages: ChatMessage[];
  messagesLength: number;
  isLoading: boolean;
}

interface UsePaginationReturn {
  isLoadingMore: boolean;
  handleLoadMore: () => void;
}

const LOAD_MORE_DEBOUNCE_MS = 2000;
const LOAD_MORE_TIMEOUT_MS = 3000;
const LOAD_MORE_BATCH_SIZE = 50;

/**
 * Hook to manage message pagination (loading older messages)
 */
export function usePagination({
  roomId,
  messages,
  messagesLength,
  isLoading,
}: UsePaginationParams): UsePaginationReturn {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadMoreTimeRef = useRef<number>(0);
  const lastLoadedMessageIdRef = useRef<string | null>(null);

  // Reset pagination state when roomId changes
  useEffect(() => {
    lastLoadMoreTimeRef.current = 0;
    lastLoadedMessageIdRef.current = null;
  }, [roomId]);

  const handleLoadMore = useCallback(() => {
    // Prevent loading if:
    // - No roomId
    // - Already loading more
    // - Initial loading is in progress
    // - No messages available
    // - Called too recently (debounce - within 2000ms to prevent rapid firing)
    const now = Date.now();
    console.log('[Chat] - usePagination - start loading more');
    if (
      !roomId ||
      isLoadingMore ||
      isLoading ||
      messagesLength === 0 ||
      now - lastLoadMoreTimeRef.current < LOAD_MORE_DEBOUNCE_MS
    ) {
      return;
    }

    console.log('[Chat] - usePagination - loading more');
    console.log('[Chat] - usePagination - messages length:', messagesLength);
    console.log('[Chat] - usePagination - first message (index 0):', messages[0]?.id, messages[0]?.content);
    console.log('[Chat] - usePagination - last message (index -1):', messages[messagesLength - 1]?.id, messages[messagesLength - 1]?.content);

    // Get the oldest message for pagination
    // After processMessagesForDisplay, the array is [oldest (index 0), ..., newest (last index)]
    // So the oldest message is at index 0
    const oldestMessageId = messages[0]?.id;
    if (!oldestMessageId) {
      // No oldest message means we can't load more
      return;
    }

    console.log('[Chat] - usePagination - oldestMessageId', oldestMessageId);
    // If we're trying to load the same message again, skip (already loading that page)
    if (oldestMessageId === lastLoadedMessageIdRef.current) {
      return;
    }
    console.log('[Chat] - usePagination - lastLoadedMessageIdRef', lastLoadedMessageIdRef.current);
    lastLoadMoreTimeRef.current = now;
    lastLoadedMessageIdRef.current = oldestMessageId;
    setIsLoadingMore(true);

    // Emit loadHistory - messages will be inserted into DB and observable will update automatically
    // Similar to chat-kit: just emit and let the observable handle updates
    chatService.getSocketService().loadHistory(roomId, LOAD_MORE_BATCH_SIZE, oldestMessageId);

    // Reset loading state after messages load (they come via socket)
    // Use a longer timeout to ensure messages have time to arrive
    setTimeout(() => {
      setIsLoadingMore(false);
    }, LOAD_MORE_TIMEOUT_MS);
  }, [roomId, isLoadingMore, isLoading, messagesLength, messages]);

  return { isLoadingMore, handleLoadMore };
}

