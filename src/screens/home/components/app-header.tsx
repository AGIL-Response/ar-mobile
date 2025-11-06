/**
 * App Header Component
 * Pixel-perfect implementation matching Figma design
 */

import React from 'react';

import { Icon, iconNames, Text, View } from '@/components';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AppHeader({ title }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        width: '100%',
        gap: 8,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      {/* Title Section */}
      <View style={{ flex: 1 }}>
        <Text
          variant="h3"
          style={{
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.goldmanRegular,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Right Section */}
      <View
        style={{
          gap: 8,
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        {/* Search Icon */}
        {/* <View
          style={{
            width: 32,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
            height: 32,
            overflow: 'hidden',
            backgroundColor: theme.colors.background.overlay,
          }}
        >
          <Icon
            name={iconNames.search}
            size={16}
            color={theme.colors.text.icon}
          />
        </View> */}
      </View>
    </View>
  );
}
