/**
 * Status Bar Component
 * Shows time and system status
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function StatusBar() {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 50,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: 15,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        9:41
      </Text>
    </View>
  );
}
