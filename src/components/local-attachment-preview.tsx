/**
 * Local Attachment Preview Component
 * Displays local file attachments (images/videos) before upload
 * Similar to IncidentAttachment but works with local URIs instead of fileIds
 */

import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { Icon, iconNames, View } from '@/components';
import { useMediaViewerStore } from '@/stores/media-viewer';
import { useTheme } from '@/theme';

import { X } from './icons';
import type { MediaItem } from './media-viewer-modal';
import { useVideoThumbnail } from './use-video-thumbnail';

interface LocalAttachment {
  id: string;
  uri: string;
  mimeType: string;
}

interface LocalAttachmentPreviewProps {
  attachment: LocalAttachment;
  allAttachments: LocalAttachment[];
  currentIndex: number;
  size?: number;
  onRemove?: () => void;
}

/**
 * Check if a mime type is a video
 */
const isVideo = (mimeType: string | null | undefined): boolean => {
  if (!mimeType) return false;
  return mimeType.toLowerCase().includes('video');
};

export function LocalAttachmentPreview({
  attachment,
  size = 100,
  onRemove,
  allAttachments,
  currentIndex,
}: LocalAttachmentPreviewProps) {
  const theme = useTheme();
  const { actions } = useMediaViewerStore();
  const isVideoFile = isVideo(attachment.mimeType);

  // Use video thumbnail hook
  const { thumbnailUri, isGenerating: isGeneratingThumbnail } =
    useVideoThumbnail({
      videoUri: isVideoFile ? attachment.uri : null,
      isVideo: isVideoFile,
      time: 15000,
      quality: 1,
    });

  const handlePress = () => {
    if (allAttachments && allAttachments.length > 0) {
      const mediaItems: MediaItem[] = allAttachments.map((att) => ({
        fileId: att.id,
        uri: att.uri,
        mimeType: att.mimeType,
      }));
      actions.openMediaViewer(mediaItems, currentIndex);
    } else {
      const mediaItem: MediaItem = {
        fileId: attachment.id,
        uri: attachment.uri,
        mimeType: attachment.mimeType,
      };
      actions.openMediaViewer([mediaItem], 0);
    }
  };

  const getPlayIcon = () => {
    if (!isVideoFile) {
      return null;
    }

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            name={iconNames.play}
            size={size * 0.3}
            color={theme.colors.semantic.white}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          width: size,
          height: size,
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.text.tertiary,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isVideoFile ? (
          <>
            {thumbnailUri ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : isGeneratingThumbnail ? (
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.background.secondary,
                }}
              >
                <Icon
                  name={iconNames.clock}
                  size={Math.min(24, size / 4)}
                  color={theme.colors.text.secondary}
                />
              </View>
            ) : (
              getPlayIcon()
            )}
            {thumbnailUri && getPlayIcon()}
          </>
        ) : (
          <Image
            source={{ uri: attachment.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* Remove Button (X icon) */}
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={{
            position: 'absolute',
            top: 3,
            right: 3,
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <X
            width={20}
            height={20}
            color={theme.colors.text.icon}
            strokeWidth={3}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
