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
  hasScrolledToEndRef: React.MutableRefObject<boolean>;
}

interface UsePaginationReturn {
  isLoadingMore: boolean;
  handleLoadMore: () => void;
}

const LOAD_MORE_DEBOUNCE_MS = 2000;
const LOAD_MORE_TIMEOUT_MS = 5000; // Increased to allow for batch processing
const LOAD_MORE_BATCH_SIZE = 50;
const MESSAGE_STABILIZE_MS = 500; // Wait for messages to stabilize after batch load

/**
 * Hook to manage message pagination (loading older messages)
 */
export function usePagination({
  roomId,
  messages,
  messagesLength,
  isLoading,
  hasScrolledToEndRef,
}: UsePaginationParams): UsePaginationReturn {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadMoreTimeRef = useRef<number>(0);
  const lastLoadedMessageIdRef = useRef<string | null>(null);
  const messageCountWhenLoadingRef = useRef<number>(0);
  const stabilizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset pagination state when roomId changes
  useEffect(() => {
    lastLoadMoreTimeRef.current = 0;
    lastLoadedMessageIdRef.current = null;
    messageCountWhenLoadingRef.current = 0;
    setIsLoadingMore(false);
    if (stabilizeTimeoutRef.current) {
      clearTimeout(stabilizeTimeoutRef.current);
      stabilizeTimeoutRef.current = null;
    }
  }, [roomId]);

  // Track when messages stabilize after loading
  useEffect(() => {
    if (isLoadingMore && messagesLength > messageCountWhenLoadingRef.current) {
      // Messages have increased - wait for them to stabilize
      if (stabilizeTimeoutRef.current) {
        clearTimeout(stabilizeTimeoutRef.current);
      }
      stabilizeTimeoutRef.current = setTimeout(() => {
        // Messages have stabilized - reset loading state
        setIsLoadingMore(false);
        stabilizeTimeoutRef.current = null;
      }, MESSAGE_STABILIZE_MS);
    }
  }, [messagesLength, isLoadingMore]);

  const handleLoadMore = useCallback(() => {
    // Prevent loading if:
    // - No roomId
    // - Already loading more
    // - Initial loading is in progress
    // - No messages available
    // - Initial scroll to end hasn't completed yet
    // - Called too recently (debounce - within 2000ms to prevent rapid firing)
    const now = Date.now();
    if (
      !roomId ||
      isLoadingMore ||
      isLoading ||
      messagesLength === 0 ||
      !hasScrolledToEndRef.current ||
      now - lastLoadMoreTimeRef.current < LOAD_MORE_DEBOUNCE_MS
    ) {
      return;
    }

    // Get the oldest message for pagination
    // Messages are in normal order: [oldest (index 0), ..., newest (last index)]
    // So the oldest message is at index 0
    const oldestMessageId = messages[0]?.id;
    if (!oldestMessageId) {
      // No oldest message means we can't load more
      return;
    }

    // If we're trying to load the same message again, skip (already loading that page)
    if (oldestMessageId === lastLoadedMessageIdRef.current) {
      return;
    }

    // Record current message count and oldest message ID before loading
    messageCountWhenLoadingRef.current = messagesLength;
    lastLoadMoreTimeRef.current = now;
    lastLoadedMessageIdRef.current = oldestMessageId;
    setIsLoadingMore(true);

    // Emit loadHistory - messages will be batch inserted into DB and observable will update once
    chatService.getSocketService().loadHistory(roomId, LOAD_MORE_BATCH_SIZE, oldestMessageId);

    // Fallback timeout in case messages don't arrive (shouldn't happen with batch upsert)
    setTimeout(() => {
      if (isLoadingMore) {
        setIsLoadingMore(false);
      }
    }, LOAD_MORE_TIMEOUT_MS);
  }, [roomId, isLoadingMore, isLoading, messagesLength, messages, hasScrolledToEndRef]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (stabilizeTimeoutRef.current) {
        clearTimeout(stabilizeTimeoutRef.current);
      }
    };
  }, []);

  return { isLoadingMore, handleLoadMore };
}

