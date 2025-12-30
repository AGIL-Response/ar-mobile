/**
 * Room Card Component
 * Displays a chat room/conversation card in the rooms list
 * Refactored following SOLID principles
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { ChatRoom } from '@/services/chat';
import { Avatar, GroupAvatar, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { useRoomCard } from '../hooks/use-room-card';

export interface RoomCardProps {
  room: ChatRoom;
  onPress?: (room: ChatRoom) => void;
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme, room.unreadCount);

  const {
    roomName,
    roomAvatarUrl,
    lastMessagePreview,
    formattedTime,
    handlePress,
  } = useRoomCard(room, onPress);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {room.type === 'group' ? (
          <GroupAvatar
            members={room.members}
            size="medium"
            maxAvatars={4}
            fallback={roomName.charAt(0).toUpperCase()}
          />
        ) : (
          <Avatar
            fileId={roomAvatarUrl}
            size="medium"
            fallback={roomName.charAt(0).toUpperCase()}
          />
        )}
        {room.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {room.unreadCount > 99 ? '99+' : room.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="body" style={styles.roomName} numberOfLines={1}>
            {roomName}
          </Text>
          {(room.lastMessageAt || room.lastMessage) && (
            <Text variant="caption" style={styles.timestamp}>
              {formattedTime}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text variant="caption" style={styles.lastMessage} numberOfLines={1}>
            {lastMessagePreview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme, unreadCount: number) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      padding: theme.spacing.gap.md,
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface.border,
    },
    avatarContainer: {
      marginRight: theme.spacing.gap.md,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.semantic.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    roomName: {
      fontWeight: unreadCount > 0 ? '600' : '400',
      color: theme.colors.text.primary,
      flex: 1,
    },
    timestamp: {
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.gap.sm,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lastMessage: {
      color: unreadCount > 0 ? theme.colors.text.primary : theme.colors.text.secondary,
      flex: 1,
      fontWeight: unreadCount > 0 ? '500' : '400',
    },
  });
