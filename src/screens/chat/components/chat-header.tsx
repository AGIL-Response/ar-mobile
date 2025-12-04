/**
 * Chat Header Component
 * Header for chat screen
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ChatHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        minHeight: 56 + insets.top,
        backgroundColor: theme.colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
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
