/**
 * App Header Component
 * Pixel-perfect implementation matching Figma design
 */

import images from '@assets/images';
import React from 'react';
import { Image, ImageBackground } from 'react-native';

import { Icon, iconNames,Text, View } from '@/components';
import { Palette, useTheme } from '@/theme';

export function AppHeader({ title }) {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 56,
        paddingHorizontal: 16,
        paddingVertical: 8,
        width: '100%',
        gap: 8,
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      {/* Title Section */}
      <View style={{ flex: 1 }}>
        <Text
          variant="h3"
          style={{
            color: theme.colors.text.primary,
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
        <View
          style={{
            width: 32,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
            height: 32,
            overflow: 'hidden',
          }}
        >
          <Icon name={iconNames.search} size={16} color={theme.colors.text.primary} />
        </View>

        {/* Notification Badge */}
        <View
          style={{
            width: 32,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
            height: 32,
            overflow: 'hidden',
          }}
        >
          <Icon
            name={iconNames.notification_badge}
            size={16}
            color={theme.colors.text.primary}
          />
        </View>

        {/* Avatar with Status */}
        <View
          style={{
            flexDirection: 'row',
            width: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: Palette.lightGrayOpacity,
              borderColor: Palette.lightGrayOpacity,
              borderWidth: 1,
              zIndex: 0,
              borderStyle: 'solid',
              borderRadius: 64,
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              flex: 1,
            }}
          >
            <ImageBackground
              style={{ flex: 1 }}
              resizeMode="cover"
              source={images.avatar_image}
            >
              <View
                style={{
                  opacity: 0,
                  alignSelf: 'stretch',
                  height: 16,
                }}
              />
              <View
                style={{
                  opacity: 0,
                  alignSelf: 'stretch',
                  height: 16,
                }}
              />
            </ImageBackground>
          </View>
          {/* Status Indicator */}
          <View
            style={{
              width: 11,
              right: -1,
              bottom: -1,
              backgroundColor: Palette.mediumSpringGreen,
              borderColor: theme.colors.background.primary,
              borderWidth: 1.3,
              height: 11,
              zIndex: 1,
              position: 'absolute',
              borderStyle: 'solid',
              borderRadius: 64,
            }}
          />
        </View>
      </View>
    </View>
  );
}
