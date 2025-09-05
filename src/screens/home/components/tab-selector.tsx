/**
 * Tab Selector Component
 * Flat View / Map View toggle
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import { Palette, useTheme } from '@/theme';

interface TabSelectorProps {
  activeTab: 'flat' | 'map';
  onTabChange: (tab: 'flat' | 'map') => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 56,
        backgroundColor: theme.colors.background.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
        onPress={() => onTabChange('flat')}
      >
        <Text
          variant="label"
          style={{
            color: activeTab === 'flat' ? theme.colors.text.primary : theme.colors.text.muted,
            textAlign: 'center',
          }}
        >
          Flat View
        </Text>
        {activeTab === 'flat' && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              height: 3,
              width: '100%',
              backgroundColor: Palette.primary,
            }}
          />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
        onPress={() => onTabChange('map')}
      >
        <Text
          variant="label"
          style={{
            color: activeTab === 'map' ? theme.colors.text.primary : theme.colors.text.muted,
            textAlign: 'center',
          }}
        >
          Map View
        </Text>
        {activeTab === 'map' && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              height: 3,
              width: '100%',
              backgroundColor: Palette.primary,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
