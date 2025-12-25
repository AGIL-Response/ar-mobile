/**
 * Custom hook to preserve scroll position when loading older messages
 * Single Responsibility: Maintain scroll position during pagination
 */

import { useEffect, useRef } from 'react';

interface UseScrollPositionPreservationParams {
  flatListRef: React.RefObject<any>;
  isLoadingMore: boolean;
  messagesLength: number;
  onScroll: (event: any) => void;
}

interface UseScrollPositionPreservationReturn {
  shouldMaintainScrollAtEnd: boolean;
  handleContentSizeChange: (contentWidth: number, contentHeight: number) => void;
  handleScroll: (event: any) => void;
}

/**
 * Hook to preserve scroll position when loading older messages (pagination)
 * When new messages are added at the top (older messages), we need to maintain
 * the visual scroll position so the user doesn't lose their place
 */
export function useScrollPositionPreservation({
  flatListRef,
  isLoadingMore,
  messagesLength,
  onScroll,
}: UseScrollPositionPreservationParams): UseScrollPositionPreservationReturn {
  const previousMessagesLengthRef = useRef<number>(messagesLength);
  const scrollOffsetRef = useRef<number>(0);
  const previousContentHeightRef = useRef<number>(0);
  const isPreservingRef = useRef<boolean>(false);

  // Track when pagination starts
  useEffect(() => {
    if (isLoadingMore) {
      isPreservingRef.current = true;
    }
  }, [isLoadingMore]);

  // Enhanced scroll handler that captures scroll position during pagination
  const handleScroll = (event: any) => {
    // Call original scroll handler
    onScroll(event);

    // Always save current scroll offset (not just during pagination)
    // This ensures we have the latest position when pagination completes
    const { contentOffset } = event.nativeEvent;
    scrollOffsetRef.current = contentOffset.y;
  };

  // Handle content size changes - adjust scroll position when new messages are added
  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    // If we were preserving scroll and content height increased (new messages added)
    if (
      isPreservingRef.current &&
      previousContentHeightRef.current > 0 &&
      contentHeight > previousContentHeightRef.current &&
      !isLoadingMore &&
      flatListRef.current &&
      scrollOffsetRef.current > 0
    ) {
      const heightDifference = contentHeight - previousContentHeightRef.current;

      // Adjust scroll position by the height of new messages added at top
      // Since messages are added at the top (index 0), we add the height difference
      const newScrollOffset = scrollOffsetRef.current + heightDifference;

      // Small delay to ensure list has finished rendering
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            if (newScrollOffset > 0 && flatListRef.current) {
              flatListRef.current.scrollToOffset?.({
                offset: newScrollOffset,
                animated: false,
              });
            }
          } catch (error) {
            console.warn('[ScrollPreservation] Could not adjust scroll position:', error);
          } finally {
            // Reset preservation state
            isPreservingRef.current = false;
          }
        }, 100);
      });
    }

    // Update previous content height
    previousContentHeightRef.current = contentHeight;
  };

  // Update previous messages length
  useEffect(() => {
    previousMessagesLengthRef.current = messagesLength;
  }, [messagesLength]);

  // Don't maintain scroll at end when loading more (pagination)
  // Only maintain scroll at end for new messages (not pagination)
  const shouldMaintainScrollAtEnd = !isLoadingMore;

  return {
    shouldMaintainScrollAtEnd,
    handleContentSizeChange,
    handleScroll,
  };
}

