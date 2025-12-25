/**
 * Room Card Component
 * Displays a chat room/conversation card in the rooms list
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { ChatRoom } from '@/services/chat';
import { Avatar, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

export interface RoomCardProps {
  room: ChatRoom;
  onPress?: (room: ChatRoom) => void;
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme, room.unreadCount);

  const handlePress = () => {
    onPress?.(room);
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getRoomName = () => {
    if (room.type === 'direct' && room.members.length > 0) {
      const otherMember = room.members.find(
        (m) => m.id !== room.members[0]?.id
      );
      return otherMember?.displayName || otherMember?.username || 'Unknown';
    }
    return room.name;
  };

  const getRoomAvatar = () => {
    if (room.type === 'direct' && room.members.length > 0) {
      const otherMember = room.members.find(
        (m) => m.id !== room.members[0]?.id
      );
      return otherMember?.avatarUrl;
    }
    return room.avatar;
  };

  const lastMessagePreview = room.lastMessage
    ? room.lastMessage.type === 'image'
      ? '📷 Image'
      : room.lastMessage.type === 'file'
      ? '📎 File'
      : room.lastMessage.content
    : 'No messages yet';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar
          fileId={getRoomAvatar()}
          size="medium"
          fallback={getRoomName().charAt(0).toUpperCase()}
          showStatus={room.type === 'direct'}
          isOnline={
            room.type === 'direct' &&
            room.members.find((m) => m.status === 'online') !== undefined
          }
        />
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
            {getRoomName()}
          </Text>
          {room.lastMessage && (
            <Text variant="caption" style={styles.timestamp}>
              {formatTime(room.lastMessage.timestamp)}
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
