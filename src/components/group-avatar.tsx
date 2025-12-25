/**
 * Group Avatar Component
 * Displays multiple member avatars in a circular layout
 * Supports 2, 3, 4, and 4+ member layouts
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import type { ChatUser } from '@/services/chat';
import { Avatar } from './avatar';
import { View } from './view';
import { Text } from './text';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import type { SizeVariant } from './types';

export interface GroupAvatarProps {
  /** Array of members to display */
  members: ChatUser[];
  /** Size variant for the avatars */
  size?: SizeVariant | 'xs' | 'xl';
  /** Maximum number of avatars to show (default: 4) */
  maxAvatars?: number;
  /** Fallback text if no members */
  fallback?: string;
}

/**
 * Get initials from a name or username
 */
function getInitials(member: ChatUser): string {
  if (member.displayName) {
    const parts = member.displayName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return member.displayName.charAt(0).toUpperCase();
  }
  if (member.username) {
    return member.username.charAt(0).toUpperCase();
  }
  return '?';
}

/**
 * Get background color for empty sections based on index
 */
function getSectionColor(index: number, theme: Theme): string {
  const colors = [
    theme.colors.surface.secondary || '#F3F4F6',
    theme.colors.surface.tertiary || '#E5E7EB',
    theme.colors.surface.secondary || '#F3F4F6',
    theme.colors.surface.tertiary || '#E5E7EB',
  ];
  return colors[index % colors.length];
}

export function GroupAvatar({
  members,
  size = 'medium',
  maxAvatars = 4,
  fallback,
}: GroupAvatarProps) {
  const theme = useTheme();
  
  // Calculate container size based on avatar size
  // Avatar sizes: xs: 24, small: 32, medium: 48, large: 64, xl: 96
  const getContainerSize = (): number => {
    const avatarSizeMap: Record<string, number> = {
      xs: 24,
      small: 32,
      medium: 48,
      large: 64,
      xl: 96,
    };
    return avatarSizeMap[size] || avatarSizeMap.medium;
  };

  const containerSize = getContainerSize();
  const memberCount = members.length;
  const displayCount = Math.min(memberCount, maxAvatars);
  const remainingCount = memberCount > maxAvatars ? memberCount - maxAvatars : 0;
  const displayMembers = members.slice(0, maxAvatars);

  const styles = createStyles(theme, size, containerSize, displayCount);

  // Render based on member count
  const renderAvatars = () => {
    if (displayCount === 0) {
      // No members - show fallback
      return (
        <View style={styles.circleContainer}>
          {fallback && (
            <Text style={styles.fallbackText}>{fallback}</Text>
          )}
        </View>
      );
    }

    if (displayCount === 1) {
      // Single member
      return (
        <View style={styles.circleContainer}>
          <Avatar
            fileId={displayMembers[0]?.avatarUrl}
            size={size}
            fallback={displayMembers[0] ? getInitials(displayMembers[0]) : fallback}
          />
        </View>
      );
    }

    if (displayCount === 2) {
      // 2 members: split vertically (left/right halves)
      return (
        <View style={styles.circleContainer}>
          <View style={styles.twoMemberLeft}>
            <Avatar
              fileId={displayMembers[0]?.avatarUrl}
              size={size}
              fallback={displayMembers[0] ? getInitials(displayMembers[0]) : '?'}
            />
          </View>
          <View style={styles.twoMemberRight}>
            <Avatar
              fileId={displayMembers[1]?.avatarUrl}
              size={size}
              fallback={displayMembers[1] ? getInitials(displayMembers[1]) : '?'}
            />
          </View>
        </View>
      );
    }

    if (displayCount === 3) {
      // 3 members: pie chart style (three sections)
      return (
        <View style={styles.circleContainer}>
          <View style={styles.threeMemberTopLeft}>
            <Avatar
              fileId={displayMembers[0]?.avatarUrl}
              size={size}
              fallback={displayMembers[0] ? getInitials(displayMembers[0]) : '?'}
            />
          </View>
          <View style={styles.threeMemberBottomLeft}>
            <Avatar
              fileId={displayMembers[1]?.avatarUrl}
              size={size}
              fallback={displayMembers[1] ? getInitials(displayMembers[1]) : '?'}
            />
          </View>
          <View style={styles.threeMemberRight}>
            <Avatar
              fileId={displayMembers[2]?.avatarUrl}
              size={size}
              fallback={displayMembers[2] ? getInitials(displayMembers[2]) : '?'}
            />
          </View>
        </View>
      );
    }

    // 4+ members: 2x2 grid
    const borderRadius = containerSize / 2;
    const quadrantPositions = [
      { left: 0, top: 0, borderTopLeftRadius: borderRadius }, // Top-left
      { right: 0, top: 0, borderTopRightRadius: borderRadius }, // Top-right
      { left: 0, bottom: 0, borderBottomLeftRadius: borderRadius }, // Bottom-left
      { right: 0, bottom: 0, borderBottomRightRadius: borderRadius }, // Bottom-right
    ];

    return (
      <View style={styles.circleContainer}>
        {Array.from({ length: 4 }).map((_, index) => {
          const member = displayMembers[index];
          const isEmpty = !member;
          const position = quadrantPositions[index];

          return (
            <View
              key={index}
              style={[
                styles.fourMemberQuadrant,
                position,
                {
                  backgroundColor: isEmpty ? getSectionColor(index, theme) : 'transparent',
                },
              ]}
            >
              {member ? (
                <Avatar
                  fileId={member.avatarUrl}
                  size={size}
                  fallback={getInitials(member)}
                />
              ) : null}
            </View>
          );
        })}
        {remainingCount > 0 && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {remainingCount > 99 ? '99+' : `+${remainingCount}`}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {renderAvatars()}
    </View>
  );
}

const createStyles = (
  theme: Theme,
  size: string,
  containerSize: number,
  memberCount: number
) => {
  const borderRadius = containerSize / 2; // Perfect circle
  const halfSize = containerSize / 2;
  const quarterSize = containerSize / 4;

  // Badge size based on container size
  const badgeSize = containerSize * 0.35;
  const badgeFontSize = containerSize * 0.12;

  return StyleSheet.create({
    container: {
      borderRadius,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface.secondary || '#F3F4F6',
    },
    circleContainer: {
      width: containerSize,
      height: containerSize,
      borderRadius,
      overflow: 'hidden',
      position: 'relative',
    },
    // 2 members layout: vertical split
    twoMemberLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: halfSize,
      height: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
    },
    twoMemberRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: halfSize,
      height: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    },
    // 3 members layout: pie chart style
    threeMemberTopLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: halfSize,
      height: halfSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderTopLeftRadius: borderRadius,
    },
    threeMemberBottomLeft: {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: halfSize,
      height: halfSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderBottomLeftRadius: borderRadius,
    },
    threeMemberRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: halfSize,
      height: containerSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    },
    // 4 members layout: 2x2 grid
    fourMemberQuadrant: {
      position: 'absolute',
      width: halfSize,
      height: halfSize,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    // Badge for 4+ members
    badgeContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -badgeSize / 2,
      marginLeft: -badgeSize / 2,
      width: badgeSize,
      height: badgeSize,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    badge: {
      width: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background.primary || '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    badgeText: {
      fontSize: badgeFontSize,
      fontWeight: '600',
      color: theme.colors.text.primary || '#000000',
    },
    fallbackText: {
      fontSize: containerSize * 0.25,
      color: theme.colors.text.secondary,
      fontWeight: '600',
    },
  });
};

