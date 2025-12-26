/**
 * Hook for managing composer state
 * Single Responsibility: Manages message and attachments state
 */

import { useState, useCallback } from 'react';
import type { MediaFile } from '@/utils/media';

interface UseComposerStateReturn {
  message: string;
  attachments: MediaFile[];
  setMessage: (message: string) => void;
  addAttachment: (attachment: MediaFile) => void;
  removeAttachment: (index: number) => void;
  clearAll: () => void;
  hasContent: boolean;
}

export function useComposerState(): UseComposerStateReturn {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MediaFile[]>([]);

  const addAttachment = useCallback((attachment: MediaFile) => {
    setAttachments((prev) => [...prev, attachment]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setMessage('');
    setAttachments([]);
  }, []);

  const hasContent = message.trim().length > 0 || attachments.length > 0;

  return {
    message,
    attachments,
    setMessage,
    addAttachment,
    removeAttachment,
    clearAll,
    hasContent,
  };
}

