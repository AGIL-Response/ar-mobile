/**
 * Map View Component
 * Contains map interface for the map view tab
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function MapView() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <Text
        variant="h3"
        style={{
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Map View
      </Text>
      <Text
        variant="body"
        style={{
          color: theme.colors.text.muted,
          textAlign: 'center',
        }}
      >
        Map interface will be implemented here
      </Text>
    </View>
  );
}
