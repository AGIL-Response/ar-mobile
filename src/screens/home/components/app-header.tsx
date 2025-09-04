/**
 * App Header Component
 * Main header with app title and navigation elements
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function AppHeader() {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 56,
        backgroundColor: theme.colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontSize: 20,
            lineHeight: 22,
            color: theme.colors.text.primary,
            textAlign: 'center',
            fontWeight: '600',
            fontFamily: 'Manrope-SemiBold',
          }}
        >
          Alpha-7 Task Force
        </Text>
      </View>
    </View>
  );
}
