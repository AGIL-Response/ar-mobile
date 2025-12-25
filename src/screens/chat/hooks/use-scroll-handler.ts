/**
 * Custom hook for scroll handling
 * Single Responsibility: Manage scroll state and auto-scroll behavior
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollHandlerParams {
  isLoading: boolean;
  messagesLength: number;
  flatListRef: React.RefObject<any>;
}

interface UseScrollHandlerReturn {
  hasScrolledFarUp: boolean;
  handleScroll: (event: any) => void;
}

const SCROLL_FAR_UP_THRESHOLD = 2; // 2 viewport heights from bottom
const INITIAL_SCROLL_DELAY_MS = 300;

/**
 * Hook to manage scroll state and auto-scroll behavior
 * Note: LegendList handles initial scroll position natively via initialScrollIndex
 * This hook only handles scroll event tracking
 */
export function useScrollHandler({
  isLoading,
  messagesLength,
  flatListRef,
}: UseScrollHandlerParams): UseScrollHandlerReturn {
  const [hasScrolledFarUp, setHasScrolledFarUp] = useState(false);
  const isAutoScrollingRef = useRef<boolean>(false);

  // Handle scroll events to detect if user scrolled away from bottom (newest messages)
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Don't process scroll events if we're auto-scrolling (to prevent infinite loops)
    if (isAutoScrollingRef.current) {
      return;
    }

    // Calculate distance from bottom (newest messages)
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const viewportHeight = layoutMeasurement.height;

    // Track if user has scrolled far up (more than 2 viewport heights from bottom)
    // Disable maintainScrollAtEnd when far up to allow manual scrolling
    const isFarUp = distanceFromBottom > viewportHeight * SCROLL_FAR_UP_THRESHOLD;
    setHasScrolledFarUp(isFarUp);
  }, []);

  return { hasScrolledFarUp, handleScroll };
}

