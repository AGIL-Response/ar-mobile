import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import type { ChatAttachment } from '@/services/chat';
import { Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import { useAudioPlayerStore } from '@/stores/audio-player';
import { formatFileSize } from '@/utils/media';

interface AudioAttachmentProps {
  attachment: ChatAttachment;
  isOwnMessage?: boolean;
  onPress?: () => void;
}

const formatTime = (millis: number) => {
  if (!millis || Number.isNaN(millis)) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const parseDuration = (durationStr?: string): number | null => {
  if (!durationStr) return null;
  const seconds = parseFloat(durationStr);
  if (Number.isNaN(seconds) || seconds < 0) return null;
  return Math.floor(seconds * 1000); // Convert to milliseconds
};

export function AudioAttachment({ attachment, isOwnMessage = false, onPress }: AudioAttachmentProps) {
  const theme = useTheme();
  const {
    currentId,
    status,
    positionMillis,
    durationMillis,
    actions,
  } = useAudioPlayerStore(
    useShallow((state) => ({
      currentId: state.currentId,
      status: state.status,
      positionMillis: state.positionMillis,
      durationMillis: state.durationMillis,
      actions: state.actions,
    }))
  );

  const isActive = currentId === attachment.id;
  const isPlaying = isActive && status === 'playing';
  const isLoading = isActive && status === 'loading';
  const isPaused = isActive && status === 'paused';

  // Use duration from store if available, otherwise parse from attachment
  const attachmentDurationMillis = useMemo(() => parseDuration(attachment.duration), [attachment.duration]);
  const effectiveDurationMillis = durationMillis || attachmentDurationMillis || 0;

  const progress = useMemo(() => {
    if (!isActive || !effectiveDurationMillis) return 0;
    return Math.min(positionMillis / effectiveDurationMillis, 1);
  }, [isActive, positionMillis, effectiveDurationMillis]);

  const handleToggle = async (event?: GestureResponderEvent) => {
    event?.stopPropagation?.();
    await actions.togglePlayPause({
      id: attachment.id,
      url: attachment.url,
      title: attachment.filename,
    });
  };

  const containerBg = isOwnMessage
    ? 'rgba(255, 255, 255, 0.1)'
    : theme.colors.background.tertiary;
  const subTextColor = isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary;
  const progressColor = isOwnMessage ? '#FFFFFF' : theme.colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={{
        flex: 1,
        width: 210,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: containerBg,
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          style={{
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={isOwnMessage ? '#FFFFFF' : theme.colors.text.primary} />
          ) : (
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={isOwnMessage ? '#FFFFFF' : theme.colors.text.primary}
            />
          )}
        </TouchableOpacity>

        <Text variant='caption' style={{ color: subTextColor }}>
          {formatTime(isActive ? positionMillis : 0)}
        </Text>

        <View
          style={{
            flex: 1,
            height: 4,
            minHeight: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.text.disabled,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${Math.max(progress * 100, 0)}%`,
              // width: 160,
              height: '100%',
              backgroundColor: progressColor,
              minWidth: progress > 0 ? 2 : 0,
            }}
          />
        </View>

        <Text variant='caption' style={{ color: subTextColor, textAlign: 'right' }}>
          {formatTime(effectiveDurationMillis)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


