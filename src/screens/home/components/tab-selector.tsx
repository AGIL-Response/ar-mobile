/**
 * Tab Selector Component
 * Flat View / Map View toggle
 */

import React, { useState } from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function TabSelector() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'flat' | 'map'>('flat');

  return (
    <View
      style={{
        height: 39,
        backgroundColor: theme.colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center',
            fontWeight: '600',
            fontFamily: 'Manrope-SemiBold',
          }}
        >
          Flat View
        </Text>
        {activeTab === 'flat' && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              height: 2,
              width: '100%',
              backgroundColor: '#1068eb', // Blue indicator
            }}
          />
        )}
      </View>
      <View
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#6a7178', // Dim gray from Figma
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center',
            fontWeight: '500',
            fontFamily: 'Manrope-Medium',
          }}
        >
          Map View
        </Text>
        {activeTab === 'map' && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              height: 2,
              width: '100%',
              backgroundColor: '#1068eb', // Blue indicator
            }}
          />
        )}
      </View>
    </View>
  );
}
