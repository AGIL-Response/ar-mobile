/**
 * Chat Header Component
 * Header for chat screen
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function ChatHeader() {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 56,
        backgroundColor: theme.colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface.border,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          color: theme.colors.text.primary,
          fontWeight: '600',
          fontFamily: 'Manrope-SemiBold',
        }}
      >
        Chat
      </Text>
    </View>
  );
}
