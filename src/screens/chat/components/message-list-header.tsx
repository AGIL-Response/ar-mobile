/**
 * Message List Header Component
 * Single Responsibility: Display loading indicator for pagination
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components';
import { useTheme } from '@/theme';

interface MessageListHeaderProps {
  isLoadingMore: boolean;
}

export function MessageListHeader({ isLoadingMore }: MessageListHeaderProps) {
  const theme = useTheme();

  if (!isLoadingMore) {
    return null;
  }

  return (
    <View
      style={{
        paddingVertical: theme.spacing.gap.md,
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text
        variant="caption"
        style={{
          color: theme.colors.text.secondary,
          marginTop: theme.spacing.gap.xs,
        }}
      >
        Loading older messages...
      </Text>
    </View>
  );
}

