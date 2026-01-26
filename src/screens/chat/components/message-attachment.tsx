/**
 * MessageAttachment Component
 * Displays attachments within a message
 */

import React from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { getMediaType } from '@/utils/media';
import type { ChatAttachment } from '@/services/chat';
import { AudioAttachment } from './audio-attachment';
import { clampRGBA } from 'react-native-reanimated/lib/typescript/Colors';

export interface MessageAttachmentProps {
  attachments: ChatAttachment[];
  onPress?: (attachment: ChatAttachment, index: number) => void;
  isOwnMessage?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
// Calculate available width accounting for message bubble constraints:
// - Message row padding: 16px on each side = 32px total
// - Content container maxWidth: 75% of (screenWidth - 32px)
// - Bubble padding: 8px on each side = 16px total
// - Bubble border: 1-2px on each side = ~4px total
// - Timestamp: ~40px minWidth
// - Additional safety margin: 20px to prevent any overflow
// Available width = ((screenWidth - 32) * 0.75) - 16 - 4 - 40 - 20
// Using a very conservative calculation to ensure it fits within the bubble
const availableWidth = (screenWidth - 32) * 0.75 - 16 - 4 - 40 - 20;
const MAX_ATTACHMENT_WIDTH = Math.min(screenWidth * 0.48, Math.max(200, availableWidth));
const IMAGE_ASPECT_RATIO = 0.75;

/**
 * Get valid URI from attachment (prioritizes thumbnail, then URL)
 * Note: For videos, only thumbnails can be used as image sources, not the video file itself
 * Similar to audio-attachment.tsx which uses attachment.url directly
 */
function getValidUri(attachment: ChatAttachment, isVideo: boolean = false, version: number = 1): string | null {
  const trimmedThumbnail = attachment.thumbnail?.trim();
  const trimmedUrl = attachment.url?.trim();

  let uri: string | null = null;

  // Always prioritize thumbnail if available
  if (trimmedThumbnail && trimmedThumbnail.length > 0) {
    uri = trimmedThumbnail;
  }
  // For videos, don't use the video file URL as an image source
  else if (isVideo) {
    if (trimmedUrl && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
      uri = trimmedUrl;
    }
  }
  // For images/files, use URL if available
  else if (trimmedUrl && trimmedUrl.length > 0) {
    uri = trimmedUrl;
  }

  // Append cache buster for remote URLs to fix "LOADING" cache issue
  if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}v=${version}`;
  }

  return uri;
}

/**
 * Image attachment renderer with auto-refresh for loading placeholders
 * Backend serves a "LOADING" placeholder image while processing thumbnails
 * We force re-renders by updating the version parameter to check if actual image is ready
 */
function ImageAttachment({ attachment, theme }: { attachment: ChatAttachment; theme: any }) {
  // Track version for cache-busting
  const [version, setVersion] = React.useState(() => {
    // Initial version based on upload time
    if (!attachment.uploadedAt) return Date.now();
    const uploadTime = new Date(attachment.uploadedAt).getTime();
    const timeSinceUpload = Date.now() - uploadTime;
    // If uploaded recently (< 10 mins), use current timestamp
    return timeSinceUpload < 10 * 60 * 1000 ? Date.now() : 1;
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshCount, setRefreshCount] = React.useState(0);
  const MAX_REFRESHES = 10; // 10 attempts
  const REFRESH_INTERVAL = 500; // 500ms

  // Auto-refresh mechanism to detect when LOADING placeholder is replaced
  React.useEffect(() => {
    // Only auto-refresh for recent attachments
    if (!attachment.uploadedAt) return;

    const uploadTime = new Date(attachment.uploadedAt).getTime();
    const timeSinceUpload = Date.now() - uploadTime;

    // Only refresh if uploaded within last 10 minutes and still loading
    if (timeSinceUpload > 10 * 60 * 1000) return;
    if (refreshCount >= MAX_REFRESHES) return;

    const timer = setTimeout(() => {
      console.log(`🔄 [ImageAttachment] Auto-refresh attempt ${refreshCount + 1}/${MAX_REFRESHES} for ${attachment.filename}`);
      setVersion(Date.now());
      setRefreshCount(prev => prev + 1);
    }, REFRESH_INTERVAL);

    return () => clearTimeout(timer);
  }, [attachment.uploadedAt, attachment.filename, refreshCount]);

  const imageUri = getValidUri(attachment, false, version);

  return (
    <View style={[styles.mediaContainer, { backgroundColor: theme.colors.background.secondary }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.mediaImage}
          contentFit="cover"
          transition={200}
          cachePolicy="none"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => {
            setIsLoading(false);
            // Stop refreshing once image loads successfully
            if (refreshCount < MAX_REFRESHES) {
              console.log(`✅ [ImageAttachment] Image loaded successfully after ${refreshCount} refreshes`);
              setRefreshCount(MAX_REFRESHES); // Stop further refreshes
            }
          }}
          onError={(error) => {
            console.warn(`❌ [ImageAttachment] Image load error:`, error);
            setIsLoading(false);
          }}
        />
      ) : (
        <View style={[styles.mediaImage, styles.emptyMediaContainer]}>
          <Text style={[styles.emptyMediaText, { color: theme.colors.text.secondary }]}>
            No image URI
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Video attachment renderer
 */
function VideoAttachment({ attachment, theme }: { attachment: ChatAttachment; theme: any }) {
  // For videos, only use actual thumbnail URLs (not video file paths)
  const thumbnailUri = getValidUri(attachment, true);

  return (
    <View style={[styles.mediaContainer, {
      backgroundColor: theme.colors.background.tertiary,
    }]}>
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.mediaImage}
          contentFit="cover"
          cachePolicy="none"
        />
      ) : (
        // Show placeholder background when no thumbnail is available
        <View style={[styles.mediaImage, styles.emptyMediaContainer]} />
      )}
      {/* Centered play button overlay */}
      <View style={styles.playButtonOverlayContainer}>
        <View style={styles.playButtonOverlay}>
          <Icon name="play" size={28} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
}

/**
 * File attachment renderer
 */
function FileAttachment({ attachment, isOwnMessage, theme }: { attachment: ChatAttachment; isOwnMessage: boolean; theme: any }) {
  return (
    <View style={styles.fileContainer}>
      <View
        style={[
          styles.fileIconContainer,
          {
            backgroundColor: isOwnMessage
              ? 'rgba(255, 255, 255, 0.2)'
              : theme.colors.background.secondary,
          },
        ]}
      >
        <Text style={styles.fileIcon}>📄</Text>
      </View>
      <Text style={styles.downloadIcon}>⬇️</Text>
    </View>
  );
}

export function MessageAttachment({
  attachments,
  onPress,
  isOwnMessage = false,
}: MessageAttachmentProps) {
  const theme = useTheme();

  if (!attachments || attachments.length === 0) {
    return null;
  }



  return (
    <View style={styles.container}>
      {attachments.map((attachment, index) => {
        const mediaType = getMediaType(attachment.filename, attachment.mimeType);
        if (mediaType === 'audio') {
          return (
            <AudioAttachment
              key={`${attachment.id}-${index}`}
              attachment={attachment}
              isOwnMessage={isOwnMessage}
              onPress={onPress ? () => onPress(attachment, index) : undefined}
            />
          );
        }

        const renderAttachment = () => {
          switch (mediaType) {
            case 'image':
              return <ImageAttachment attachment={attachment} theme={theme} />;
            case 'video':
              return <VideoAttachment attachment={attachment} theme={theme} />;
            default:
              return <FileAttachment attachment={attachment} isOwnMessage={isOwnMessage} theme={theme} />;
          }
        };

        return (
          <TouchableOpacity
            key={`${attachment.id}-${index}`}
            onPress={() => onPress?.(attachment, index)}
            activeOpacity={0.8}
            style={[
              styles.attachmentWrapper,
              {
                backgroundColor: isOwnMessage
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.background.tertiary,
              },
            ]}
          >
            {renderAttachment()}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  attachmentWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: MAX_ATTACHMENT_WIDTH,
  },
  mediaContainer: {
    width: MAX_ATTACHMENT_WIDTH,
    height: MAX_ATTACHMENT_WIDTH * IMAGE_ASPECT_RATIO,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  emptyMediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMediaText: {
    fontSize: 12,
  },
  filenameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filenameText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  playButtonOverlayContainer: {
    width: MAX_ATTACHMENT_WIDTH,
    height: MAX_ATTACHMENT_WIDTH * IMAGE_ASPECT_RATIO,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
  },
  downloadIcon: {
    fontSize: 20,
  },
});

