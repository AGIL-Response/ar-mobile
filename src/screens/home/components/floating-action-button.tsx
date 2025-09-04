/**
 * Floating Action Button Component
 * Main action button for creating new items
 */

import React from 'react';

import { Text, View } from '@/components';

export function FloatingActionButton() {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 100, // Above tab bar
        right: 16,
        width: 56,
        height: 56,
        backgroundColor: '#1068eb', // Blue from Figma
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
        }}
      >
        +
      </Text>
    </View>
  );
}
