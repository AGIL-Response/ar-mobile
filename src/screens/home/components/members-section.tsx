/**
 * Members Section Component
 * Display team members with avatars
 */

import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components';
import { Palette, useTheme } from '@/theme';
import images from '@assets/images';

export function MembersSection() {
  const theme = useTheme();

  // Mock data for members
  const members = [1, 2, 3, 4]; // 4 visible members
  const additionalMembersCount = 2; // +2 more

  return (
    <View style={{ gap: 16 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          variant="h4"
          style={{
            color: theme.colors.text.primary,
          }}
        >
          Members
        </Text>
        <TouchableOpacity>
          <Text
            variant="caption"
            style={{
              color: Palette.primary,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Member Avatars */}
        {members.map((member, index) => (
          <View
            key={member}
            style={{
              position: 'relative',
              width: 60,
              height: 60,
            }}
          >
            <Image
              source={images.avatar_image}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                borderWidth: 2,
                borderColor: theme.colors.background.primary,
              }}
              resizeMode="cover"
            />
            {/* Online Status Indicator */}
            <View
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: Palette.mediumSpringGreen,
                borderWidth: 2,
                borderColor: theme.colors.background.primary,
              }}
            />
          </View>
        ))}

        {/* Additional Members Indicator */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.background.primary,
          }}
        >
          <Text
            variant="label"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            +{additionalMembersCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
