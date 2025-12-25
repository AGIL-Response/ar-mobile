/**
 * MessageAttachment Component
 * Displays attachments within a message
 */

import React from 'react';
import { View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { formatFileSize, getMediaType } from '@/utils/media';
import type { ChatAttachment } from '@/services/chat';
import { AudioAttachment } from './audio-attachment';

export interface MessageAttachmentProps {
  attachments: ChatAttachment[];
  onPress?: (attachment: ChatAttachment, index: number) => void;
  isOwnMessage?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_ATTACHMENT_WIDTH = screenWidth * 0.65;

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
    <View style={{ gap: 8 }}>
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

        return (
          <TouchableOpacity
            key={`${attachment.id}-${index}`}
            onPress={() => onPress?.(attachment, index)}
            activeOpacity={0.8}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: isOwnMessage
                ? 'rgba(255, 255, 255, 0.1)'
                : theme.colors.background.tertiary,
            }}
          >
            {mediaType === 'image' ? (
              <View>
                {(() => {
                  // Use thumbnail if available, otherwise fall back to full URL
                  const imageUri = (attachment.thumbnail && attachment.thumbnail.trim()) 
                    ? attachment.thumbnail.trim() 
                    : (attachment.url && attachment.url.trim() ? attachment.url.trim() : null);
                  
                  if (!imageUri) return null;
                  
                  return (
                    <Image
                      source={{ uri: imageUri }}
                      style={{
                        width: MAX_ATTACHMENT_WIDTH,
                        height: MAX_ATTACHMENT_WIDTH * 0.75,
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  );
                })()}
                {/* Overlay for better visibility */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: '#FFFFFF',
                      fontSize: 11,
                    }}
                    numberOfLines={1}
                  >
                    {attachment.filename}
                  </Text>
                </View>
              </View>
            ) : mediaType === 'video' ? (
              <View
                style={{
                  width: MAX_ATTACHMENT_WIDTH,
                  height: MAX_ATTACHMENT_WIDTH * 0.75,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.background.tertiary,
                  position: 'relative',
                }}
              >
                {(() => {
                  // Use thumbnail if available, otherwise fall back to full URL
                  const thumbnailUri = (attachment.thumbnail && attachment.thumbnail.trim()) 
                    ? attachment.thumbnail.trim() 
                    : (attachment.url && attachment.url.trim() ? attachment.url.trim() : null);
                  
                  if (!thumbnailUri) return null;
                  
                  return (
                    <Image
                      source={{ uri: thumbnailUri }}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                      }}
                      resizeMode="cover"
                    />
                  );
                })()}
                {/* Play icon overlay */}
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="play" size={28} color="#FFFFFF" />
                </View>
                {/* Filename */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: '#FFFFFF',
                      fontSize: 11,
                    }}
                    numberOfLines={1}
                  >
                    {attachment.filename}
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isOwnMessage
                      ? 'rgba(255, 255, 255, 0.2)'
                      : theme.colors.background.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>📄</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    style={{
                      color: isOwnMessage ? '#FFFFFF' : theme.colors.text.primary,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {attachment.filename}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: isOwnMessage
                        ? 'rgba(255, 255, 255, 0.7)'
                        : theme.colors.text.secondary,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {formatFileSize(attachment.size)}
                  </Text>
                </View>
                <Text style={{ fontSize: 20 }}>⬇️</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

