/**
 * Custom hook for media viewer state
 * Single Responsibility: Manage media viewer visibility and selected attachments
 */

import { useCallback, useState } from 'react';
import type { ChatAttachment } from '@/services/chat';

interface UseMediaViewerReturn {
  mediaViewerVisible: boolean;
  selectedAttachments: ChatAttachment[];
  selectedAttachmentIndex: number;
  handleAttachmentPress: (attachments: ChatAttachment[], index: number) => void;
  handleCloseMediaViewer: () => void;
}

/**
 * Hook to manage media viewer state
 */
export function useMediaViewer(): UseMediaViewerReturn {
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<ChatAttachment[]>([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);

  const handleAttachmentPress = useCallback((attachments: ChatAttachment[], index: number) => {
    if (!attachments || attachments.length === 0) return;

    setSelectedAttachments(attachments);
    setSelectedAttachmentIndex(index);
    setMediaViewerVisible(true);
  }, []);

  const handleCloseMediaViewer = useCallback(() => {
    setMediaViewerVisible(false);
  }, []);

  return {
    mediaViewerVisible,
    selectedAttachments,
    selectedAttachmentIndex,
    handleAttachmentPress,
    handleCloseMediaViewer,
  };
}

