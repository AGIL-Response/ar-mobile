/**
 * Local Attachments Gallery Component
 * Manages a gallery of local file attachments (before upload)
 * Similar to AttachmentsGallery but works with local URIs
 */

import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useMediaViewerStore } from '@/stores/media-viewer';

import { LocalAttachmentPreview } from './local-attachment-preview';
import { MediaViewerModal } from './media-viewer-modal';

export interface LocalAttachment {
  id: string;
  uri: string;
  mimeType: string;
}

interface LocalAttachmentsGalleryProps {
  attachments: LocalAttachment[];
  onRemove?: (attachmentId: string) => void;
  size?: number;
  gap?: number;
}

export function LocalAttachmentsGallery({
  attachments,
  onRemove,
  size,
  gap = 12,
}: LocalAttachmentsGalleryProps) {
  const { isOpen, mediaItems, initialIndex, actions } = useMediaViewerStore();
  const { width: screenWidth } = useWindowDimensions();

  const containerPadding = 32;
  const itemsPerRow = 3;
  const totalGaps = (itemsPerRow - 1) * gap;
  const availableWidth = screenWidth - containerPadding;
  const itemWidth = (availableWidth - totalGaps) / itemsPerRow;

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {attachments.map((attachment, index) => (
          <LocalAttachmentPreview
            key={attachment.id}
            attachment={attachment}
            size={size || itemWidth}
            allAttachments={attachments}
            currentIndex={index}
            onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
          />
        ))}
      </View>

      <MediaViewerModal
        visible={isOpen}
        mediaItems={mediaItems}
        initialIndex={initialIndex}
        onClose={actions.closeMediaViewer}
      />
    </>
  );
}
