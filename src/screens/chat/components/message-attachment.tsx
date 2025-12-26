/**
 * MessageAttachment Component
 * Displays attachments within a message
 */

import React from 'react';
import { View, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { getMediaType } from '@/utils/media';
import type { ChatAttachment } from '@/services/chat';
import { AudioAttachment } from './audio-attachment';

export interface MessageAttachmentProps {
  attachments: ChatAttachment[];
  onPress?: (attachment: ChatAttachment, index: number) => void;
  isOwnMessage?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_ATTACHMENT_WIDTH = screenWidth * 0.65;
const IMAGE_ASPECT_RATIO = 0.75;

/**
 * Get valid URI from attachment (prioritizes thumbnail, then URL)
 * Note: For videos, only thumbnails can be used as image sources, not the video file itself
 * Similar to audio-attachment.tsx which uses attachment.url directly
 */
function getValidUri(attachment: ChatAttachment, isVideo: boolean = false): string | null {
  const trimmedThumbnail = attachment.thumbnail?.trim();
  const trimmedUrl = attachment.url?.trim();

  // Always prioritize thumbnail if available
  if (trimmedThumbnail && trimmedThumbnail.length > 0) {
    return trimmedThumbnail;
  }

  // For videos, don't use the video file URL as an image source (Image component can't display videos)
  // Only use HTTP/HTTPS URLs that are actual image thumbnails
  if (isVideo) {
    // Only return URL if it's an HTTP/HTTPS URL (likely a thumbnail from server)
    if (trimmedUrl && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
      return trimmedUrl;
    }
    return null;
  }

  // For images and other attachments, use URL if available
  // The url field should contain either the server URL or the local path (converted from localPath by attachmentToChatAttachment)
  if (trimmedUrl && trimmedUrl.length > 0) {
    return trimmedUrl;
  }

  return null;
}

/**
 * Filename overlay component
 */
function FilenameOverlay({ filename, backgroundColor = 'rgba(0, 0, 0, 0.3)' }: { filename: string; backgroundColor?: string }) {
  return (
    <View
      style={[
        styles.filenameOverlay,
        { backgroundColor },
      ]}
    >
      <Text variant="caption" style={styles.filenameText} numberOfLines={1}>
        {filename}
      </Text>
    </View>
  );
}

/**
 * Image attachment renderer
 * Similar to audio-attachment.tsx which uses attachment.url directly
 */
function ImageAttachment({ attachment, theme }: { attachment: ChatAttachment; theme: any }) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message-attachment.tsx:79', message: 'ImageAttachment - INPUT', data: { attachmentId: attachment.id, filename: attachment.filename, inputUrl: attachment.url?.substring(0, 50), inputThumbnail: attachment.thumbnail?.substring(0, 50), hasInputUrl: !!attachment.url, hasInputThumbnail: !!attachment.thumbnail, inputUrlLength: attachment.url?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion

  const imageUri = getValidUri(attachment);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message-attachment.tsx:81', message: 'ImageAttachment - getValidUri result', data: { attachmentId: attachment.id, filename: attachment.filename, imageUri: imageUri || null, imageUriLength: imageUri?.length || 0, hasImageUri: !!imageUri, isFileUri: imageUri?.startsWith('file://') || false, isHttpUri: imageUri?.startsWith('http') || false }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion

  // Debug: Log attachment details to help diagnose display issues
  if (!imageUri) {
    console.log('[ImageAttachment] No valid URI:', {
      id: attachment.id,
      filename: attachment.filename,
      url: attachment.url?.substring(0, 50),
      thumbnail: attachment.thumbnail?.substring(0, 50),
      hasUrl: !!attachment.url,
      urlLength: attachment.url?.length || 0,
    });
  }

  return (
    <View style={[styles.mediaContainer, { backgroundColor: theme.colors.background.secondary }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.mediaImage}
          resizeMode="cover"
          onError={(error) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message-attachment.tsx:110', message: 'ImageAttachment - Image load ERROR', data: { attachmentId: attachment.id, filename: attachment.filename, imageUri: imageUri || null, error: String(error.nativeEvent?.error || error) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
            console.error('[ImageAttachment] Image load error:', {
              uri: imageUri.substring(0, 50),
              error: error.nativeEvent?.error || error,
              attachmentId: attachment.id,
            });
          }}
          onLoad={() => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message-attachment.tsx:122', message: 'ImageAttachment - Image load SUCCESS', data: { attachmentId: attachment.id, filename: attachment.filename, imageUri: imageUri || null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
            // #endregion
          }}
        />
      ) : (
        <View style={[styles.mediaImage, styles.emptyMediaContainer]}>
          <Text style={[styles.emptyMediaText, { color: theme.colors.text.secondary }]}>
            No image URI
          </Text>
        </View>
      )}
      <FilenameOverlay filename={attachment.filename} />
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
    <View style={[styles.mediaContainer, { backgroundColor: theme.colors.background.tertiary }]}>
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={[styles.mediaImage, styles.absoluteFill]}
          resizeMode="cover"
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
        const mediaType = getMediaType(attachment.filename);

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
  absoluteFill: {
    position: 'absolute',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
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

