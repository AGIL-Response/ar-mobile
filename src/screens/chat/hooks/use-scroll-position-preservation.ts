/**
 * Custom hook to manage scroll behavior during pagination
 * Single Responsibility: Control maintainScrollAtEnd behavior
 * 
 * Note: LegendList's maintainVisibleContentPosition handles scroll position preservation,
 * but we still need to disable maintainScrollAtEnd during pagination to prevent jumping to bottom
 */

interface UseScrollPositionPreservationParams {
  isLoadingMore: boolean;
}

interface UseScrollPositionPreservationReturn {
  shouldMaintainScrollAtEnd: boolean;
}

/**
 * Hook to manage scroll behavior during pagination
 * - Disables maintainScrollAtEnd when loading older messages (pagination)
 * - Enables maintainScrollAtEnd for new messages (not pagination)
 */
export function useScrollPositionPreservation({
  isLoadingMore,
}: UseScrollPositionPreservationParams): UseScrollPositionPreservationReturn {
  // Don't maintain scroll at end when loading more (pagination)
  // Only maintain scroll at end for new messages (not pagination)
  const shouldMaintainScrollAtEnd = !isLoadingMore;

  return {
    shouldMaintainScrollAtEnd,
  };
}

