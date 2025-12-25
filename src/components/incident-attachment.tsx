/**
 * Incident Attachment Component
 * Displays incident file attachments by fetching and rendering file content
 * Supports both images and videos with play icon overlay for videos
 */

import React, { useEffect } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

import { Icon, iconNames, Text, View } from '@/components';
import { useMediaViewerStore } from '@/stores/media-viewer';
import { useTheme } from '@/theme';

import type { MediaItem } from './media-viewer-modal';
import { useVideoThumbnail } from './use-video-thumbnail';
import { type FileSourceProps, withFileSource } from './withFileSource';

interface IncidentAttachmentProps extends FileSourceProps {
  fileId: string;
  size?: number;
  onPress?: () => void;
  currentIndex?: number;
  allMediaItems?: MediaItem[];
  onLoad?: (fileId: string, mediaItem: MediaItem) => void;
}

interface IncidentAttachmentBaseProps extends IncidentAttachmentProps {
  sourceResult?: FileSourceProps['sourceResult'];
  mimeType?: FileSourceProps['mimeType'];
  isLoading?: FileSourceProps['isLoading'];
  error?: FileSourceProps['error'];
  /** All media items for navigation (optional, for gallery view) */
  allMediaItems?: MediaItem[];
  /** Callback when file is loaded (for gallery to collect all items) */
  onLoad?: (fileId: string, mediaItem: MediaItem) => void;
}

/**
 * Check if a mime type is a video
 */
const isVideo = (mimeType: string | null | undefined): boolean => {
  if (!mimeType) return false;
  return mimeType.startsWith('video/');
};

const IncidentAttachmentBase = ({
  fileId,
  size = 100,
  onPress,
  sourceResult,
  mimeType,
  isLoading = false,
  error = null,
  allMediaItems,
  currentIndex = 0,
  onLoad,
}: IncidentAttachmentBaseProps) => {
  const theme = useTheme();
  const { actions } = useMediaViewerStore();
  const isVideoFile = isVideo(mimeType);

  // Extract video URI safely
  const videoUri =
    sourceResult &&
    typeof sourceResult === 'object' &&
    'uri' in sourceResult &&
    typeof sourceResult.uri === 'string'
      ? sourceResult.uri
      : null;
  // Generate video thumbnail using hook
  const { thumbnailUri, isGenerating: isGeneratingThumbnail } =
    useVideoThumbnail({
      videoUri: isLoading || error ? null : videoUri,
      isVideo: isVideoFile,
      time: 15000,
    });

  // Notify parent when file is loaded (for gallery collection)
  // Use ref to track if we've already notified for this file/URI combination
  const notifiedRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (
      onLoad &&
      sourceResult &&
      typeof sourceResult === 'object' &&
      'uri' in sourceResult &&
      typeof sourceResult.uri === 'string' &&
      mimeType &&
      !isLoading &&
      !error
    ) {
      // Create a unique key for this file/URI combination
      const notificationKey = `${fileId}:${sourceResult.uri}`;

      // Only call onLoad if we haven't notified for this exact file/URI yet
      if (notifiedRef.current !== notificationKey) {
        const mediaItem: MediaItem = {
          fileId: fileId,
          uri: sourceResult.uri,
          mimeType,
        };
        onLoad(fileId, mediaItem);
        notifiedRef.current = notificationKey;
      }
    }
  }, [fileId, sourceResult, mimeType, isLoading, error, onLoad]);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (error) {
      Alert.alert('Error', 'Failed to load attachment');
      return;
    }

    if (
      !sourceResult ||
      typeof sourceResult !== 'object' ||
      !('uri' in sourceResult) ||
      typeof sourceResult.uri !== 'string'
    ) {
      return;
    }

    // If we have all media items, use the unified media viewer
    if (allMediaItems && allMediaItems.length > 0) {
      actions.openMediaViewer(allMediaItems, currentIndex);
      return;
    }

    // Fallback: create a single-item array for the media viewer
    const singleItem: MediaItem = {
      fileId: fileId,
      uri: sourceResult.uri,
      mimeType: mimeType || '',
    };
    actions.openMediaViewer([singleItem], 0);
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
        <Icon
          name={iconNames.play}
          size={size * 0.3}
          color={theme.colors.semantic.white}
        />
      </View>
    );
  };

  const getLoadingIndicator = () => {
    return (
      <View style={{ alignItems: 'center', gap: 4, overflow: 'hidden' }}>
        <Icon
          name={iconNames.clock}
          size={Math.min(24, size / 4)}
          color={theme.colors.semantic.white}
        />
        <Text
          variant="caption"
          style={{
            color: theme.colors.semantic.white,
            textAlign: 'center',
            fontSize: Math.min(10, size / 10),
          }}
        >
          Loading...
        </Text>
      </View>
    );
  };

  return (
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
      testID={`incident-attachment-${fileId}`}
    >
      {isLoading ? (
        getLoadingIndicator()
      ) : error ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon
            name={iconNames.incident}
            size={Math.min(24, size / 4)}
            color={theme.colors.semantic.error}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
              fontSize: Math.min(10, size / 10),
            }}
          >
            Error
          </Text>
        </View>
      ) : sourceResult ? (
        <View style={{ width: '100%', height: '100%', position: 'relative' }}>
          {isVideoFile ? (
            <>
              {thumbnailUri && (
                <>
                  <Image
                    source={{ uri: thumbnailUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  {getPlayIcon()}
                </>
              )}
            </>
          ) : (
            <Image
              source={sourceResult}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Icon
            name={iconNames.plus}
            size={Math.min(24, size / 4)}
            color={theme.colors.semantic.white}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.semantic.white,
              textAlign: 'center',
              fontSize: Math.min(10, size / 10),
            }}
          >
            Tap to load
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

IncidentAttachmentBase.displayName = 'IncidentAttachmentBase';

/**
 * IncidentAttachment component with file loading support via HOC
 */
export const IncidentAttachment = withFileSource(IncidentAttachmentBase, {
  autoLoad: true,
  logErrors: true,
}) as React.ComponentType<
  Omit<
    IncidentAttachmentProps,
    'sourceResult' | 'isLoading' | 'error' | 'mimeType'
  >
>;
