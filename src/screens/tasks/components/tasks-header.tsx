/**
 * Tasks Header Component
 * Header for tasks screen
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function TasksHeader() {
  const theme = useTheme();

  return (
    <View
      testID="tasks-header-container"
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
        Tasks
      </Text>
    </View>
  );
}
