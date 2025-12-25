/**
 * Attachments Gallery Component
 * Manages a gallery of attachments with unified media viewer
 * Uses withFileSource pattern - each attachment loads its own file
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useMediaViewerStore } from '@/stores/media-viewer';

import { IncidentAttachment } from './incident-attachment';
import type { MediaItem } from './media-viewer-modal';
import { MediaViewerModal } from './media-viewer-modal';

interface AttachmentsGalleryProps {
  fileIds: string[];
  size?: number;
  gap?: number;
}

export function AttachmentsGallery({
  fileIds,
  size,
  gap = 12,
}: AttachmentsGalleryProps) {
  const { isOpen, mediaItems, initialIndex, actions } = useMediaViewerStore();
  const { width: screenWidth } = useWindowDimensions();

  // Store loaded media items from IncidentAttachment components
  // Each IncidentAttachment will load its own file via withFileSource
  // and we'll collect them here for the media viewer
  const [loadedMediaItemsMap, setLoadedMediaItemsMap] = useState<
    Record<string, MediaItem>
  >({});

  const allMediaItems = useMemo(() => {
    return fileIds
      .map((fileId) => loadedMediaItemsMap[fileId])
      .filter((item): item is MediaItem => item !== undefined);
  }, [fileIds, loadedMediaItemsMap]);

  const handleMediaItemLoaded = useCallback(
    (fileId: string, mediaItem: MediaItem) => {
      setLoadedMediaItemsMap((prev) => {
        if (prev[fileId]?.uri === mediaItem.uri) {
          return prev; // No change, return same reference
        }
        return {
          ...prev,
          [fileId]: mediaItem,
        };
      });
    },
    []
  );

  // Get current index for a fileId
  const getCurrentIndex = (fileId: string): number => {
    return allMediaItems.findIndex((item) => item.fileId === fileId);
  };

  const containerPadding = 32;
  const itemsPerRow = 3;
  const totalGaps = (itemsPerRow - 1) * gap;
  const availableWidth = screenWidth - containerPadding;
  const itemWidth = (availableWidth - totalGaps) / itemsPerRow;

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {fileIds.map((fileId) => {
          const currentIndex = getCurrentIndex(fileId);

          return (
            <View
              key={fileId}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap,
              }}
            >
              <IncidentAttachment
                fileId={fileId}
                size={size || itemWidth}
                allMediaItems={allMediaItems}
                currentIndex={currentIndex >= 0 ? currentIndex : 0}
                onLoad={handleMediaItemLoaded}
              />
            </View>
          );
        })}
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
