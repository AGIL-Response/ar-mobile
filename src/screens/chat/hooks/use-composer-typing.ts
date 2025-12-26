/**
 * Hook for managing typing indicator
 * Single Responsibility: Manages typing state and timeout
 */

import { useRef, useCallback } from 'react';

interface UseComposerTypingProps {
  onTyping?: (isTyping: boolean) => void;
}

interface UseComposerTypingReturn {
  handleTextChange: (text: string) => void;
}

const TYPING_TIMEOUT_MS = 3000;

export function useComposerTyping({ onTyping }: UseComposerTypingProps): UseComposerTypingReturn {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback(
    (text: string) => {
      if (!onTyping) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      onTyping(true);

      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, TYPING_TIMEOUT_MS);
    },
    [onTyping]
  );

  return {
    handleTextChange,
  };
}

