/**
 * Custom hook to track initial message loading state
 * Single Responsibility: Detect when initial messages are loading and stabilize
 */

import { useEffect, useRef, useState } from 'react';

interface UseInitialMessagesLoadingParams {
  roomId: string | undefined;
  messages: unknown[];
  isLoading: boolean;
}

interface UseInitialMessagesLoadingReturn {
  isInitialLoading: boolean;
}

const MESSAGE_STABILIZATION_DELAY_MS = 500; // Wait 500ms after last message change
const MAX_INITIAL_LOAD_TIME_MS = 5000; // Max 5 seconds for initial load

/**
 * Hook to track initial message loading and prevent list jumping
 * Shows loading until messages stabilize (no changes for a period)
 */
export function useInitialMessagesLoading({
  roomId,
  messages,
  isLoading,
}: UseInitialMessagesLoadingParams): UseInitialMessagesLoadingReturn {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const stabilizationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  const previousRoomIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Reset loading state when roomId changes
    if (roomId !== previousRoomIdRef.current) {
      previousRoomIdRef.current = roomId;
      // Initialize previous length to current length to avoid false change detection
      previousMessagesLengthRef.current = messages.length;
      setIsInitialLoading(true);

      // Clear any existing timeouts
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
        stabilizationTimeoutRef.current = null;
      }
      if (maxLoadTimeoutRef.current) {
        clearTimeout(maxLoadTimeoutRef.current);
        maxLoadTimeoutRef.current = null;
      }

      // If messages are already loaded (from cache), show after a short delay
      // This gives time for any new messages to start loading
      if (messages.length > 0 && !isLoading) {
        stabilizationTimeoutRef.current = setTimeout(() => {
          setIsInitialLoading(false);
        }, MESSAGE_STABILIZATION_DELAY_MS);
      } else {
        // Set max load timeout - if messages don't load within 5 seconds, show anyway
        maxLoadTimeoutRef.current = setTimeout(() => {
          setIsInitialLoading(false);
        }, MAX_INITIAL_LOAD_TIME_MS);
      }
    }

    // If room data is still loading, keep showing loading indicator
    if (isLoading) {
      return;
    }

    // Check if messages have changed
    const currentMessagesLength = messages.length;
    const messagesChanged = currentMessagesLength !== previousMessagesLengthRef.current;

    if (messagesChanged) {
      previousMessagesLengthRef.current = currentMessagesLength;

      // Clear existing stabilization timeout
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
      }

      // Set new stabilization timeout - wait for messages to stop changing
      stabilizationTimeoutRef.current = setTimeout(() => {
        // Messages have stabilized - hide loading indicator
        setIsInitialLoading(false);

        // Clear max load timeout since we're done
        if (maxLoadTimeoutRef.current) {
          clearTimeout(maxLoadTimeoutRef.current);
          maxLoadTimeoutRef.current = null;
        }
      }, MESSAGE_STABILIZATION_DELAY_MS);
    } else if (currentMessagesLength === 0 && !isLoading) {
      // No messages and not loading - might be empty room, show anyway after a short delay
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
      }
      stabilizationTimeoutRef.current = setTimeout(() => {
        setIsInitialLoading(false);
        if (maxLoadTimeoutRef.current) {
          clearTimeout(maxLoadTimeoutRef.current);
          maxLoadTimeoutRef.current = null;
        }
      }, MESSAGE_STABILIZATION_DELAY_MS);
    }

    // Cleanup on unmount or roomId change
    return () => {
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
      }
      if (maxLoadTimeoutRef.current) {
        clearTimeout(maxLoadTimeoutRef.current);
      }
    };
  }, [roomId, messages.length, isLoading]);

  return { isInitialLoading };
}

