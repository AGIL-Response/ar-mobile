/**
 * AttachmentPreview Component
 * Shows preview of selected files before sending
 */

import React from 'react';
import { View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { formatFileSize, getMediaType } from '@/utils/media';
import type { MediaFile } from '@/utils/media';

export interface AttachmentPreviewProps {
  attachments: MediaFile[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  const theme = useTheme();

  if (attachments.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface.border,
        paddingVertical: theme.spacing.gap.sm,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.gap.md,
          gap: theme.spacing.gap.sm,
        }}
      >
        {attachments.map((attachment, index) => {
          const mediaType = getMediaType(attachment.name);

          return (
            <View
              key={index}
              style={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: theme.colors.background.secondary,
              }}
            >
              {/* Preview based on media type */}
              {mediaType === 'image' ? (
                <Image
                  source={{ uri: attachment.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : mediaType === 'video' ? (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background.tertiary,
                  }}
                >
                  <Icon name="play" size={32} color={theme.colors.text.secondary} />
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    Video
                  </Text>
                </View>
              ) : mediaType === 'audio' ? (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background.tertiary,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>🎵</Text>
                  <Text
                    variant="caption"
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    Audio
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background.tertiary,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>📄</Text>
                </View>
              )}

              {/* Remove button */}
              <TouchableOpacity
                onPress={() => onRemove(index)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>

              {/* File size label */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  paddingVertical: 2,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  variant="caption"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 9,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {formatFileSize(attachment.size)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

