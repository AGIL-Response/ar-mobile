/**
 * Notifications Screen
 * Display user notifications and alerts
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import type {
  NotificationType,
  UserNotification,
} from '@/api/notifications/types';
import {
  AppBar,
  Background,
  Center,
  Icon,
  iconNames,
  Text,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { useTheme } from '@/theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const notificationsState = useNotificationsStore();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { notifications, isLoading, error, actions } = notificationsState;

  // Reverse notifications to show latest first
  const reversedNotifications = useMemo(() => {
    return [...notifications].reverse();
  }, [notifications]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    const userId = authState.user?.id;
    if (userId) {
      actions.fetchNotifications({
        userId,
      });
    }
  }, [authState.user?.id, actions]);

  // Get notification type icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'task_assigned':
        return iconNames.list;
      case 'incident_assigned':
        return iconNames.incident;
      case 'task_completed':
        return iconNames.change;
      case 'incident_resolved':
        return iconNames.change;
      case 'team_update':
        return iconNames.user;
      case 'system_maintenance':
      default:
        return iconNames.notification_badge;
    }
  };

  // Get notification type color
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'task_assigned':
        return theme.colors.semantic.blue;
      case 'incident_assigned':
        return theme.colors.semantic.warning;
      case 'task_completed':
        return theme.colors.semantic.success;
      case 'incident_resolved':
        return theme.colors.semantic.success;
      case 'team_update':
        return theme.colors.semantic.success;
      case 'system_maintenance':
      default:
        return theme.colors.semantic.warning;
    }
  };

  // Handle notification press
  const handleNotificationPress = useCallback(
    async (notification: UserNotification) => {
      try {
        // Mark as read if it's unread (case-insensitive check)
        if (notification.status?.toLowerCase() === 'unread') {
          await actions.markNotificationRead(
            notification.notificationId,
            'read'
          );
        } else {
        }

        // Handle navigation based on notification type and metadata
        const { type, metadata } = notification;

        if (type.includes('task') && metadata.entityType === 'task') {
          router.push(`/task/${metadata.id}`);
        } else if (
          type.includes('incident') &&
          metadata.entityType === 'incident'
        ) {
          router.push(`/incidents/${metadata.id}`);
        }
      } catch (error) {
        console.error('❌ Failed to handle notification press:', error);
        Alert.alert('Error', 'Failed to update notification');
      }
    },
    [actions]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) return;

    setIsRefreshing(true);
    try {
      await actions.fetchNotifications({
        userId,
      });
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [authState.user?.id, actions]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) return;

    try {
      await actions.markAllNotificationsRead(userId);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  }, [authState.user?.id, actions]);

  // Render notification item
  const renderNotificationItem = ({ item }: { item: UserNotification }) => {
    const isRead = item.status?.toLowerCase() === 'read';

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={{
          backgroundColor: isRead
            ? theme.colors.background.primary
            : theme.colors.background.qua,
          borderWidth: 2,
          borderColor: isRead
            ? theme.colors.surface.border
            : theme.colors.surface.activeBorder,
          padding: 16,
          borderRadius: 2,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Notification Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${getNotificationColor(item.type)}20`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name={getNotificationIcon(item.type)}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>

          {/* Notification Content */}
          <View style={{ flex: 1, gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Text
                variant="h4"
                style={{
                  color: theme.colors.text.tertiary,
                  fontFamily: theme.fonts.goldmanRegular,
                }}
              >
                {item.metadata?.name || 'Notification'}
              </Text>
            </View>

            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              {item.message}
            </Text>

            <Text
              variant="caption"
              style={{
                color: theme.colors.text.disabled,
                paddingTop: 4,
              }}
            >
              {formatTimestamp(item.createdAt)}
            </Text>

            {/* Unread indicator */}
            {!isRead && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 7,
                  backgroundColor: theme.colors.semantic.error,
                  borderWidth: 1,
                  borderColor: theme.colors.semantic.white,
                  position: 'absolute',
                  top: 10,
                  right: 0,
                }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(
    (n) => n.status?.toLowerCase() === 'unread'
  ).length;

  // Show loading state
  if (isLoading && notifications.length === 0) {
    return (
      <Background>
        <AppBar
          title="Notifications"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Loading notifications...
          </Text>
        </Center>
      </Background>
    );
  }

  // Show error state
  if (error) {
    return (
      <Background>
        <AppBar
          title="Notifications"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </Center>
      </Background>
    );
  }

  return (
    <Background>
      {/* Header */}
      <AppBar
        title="Notifications"
        titleFontFamily={theme.fonts.goldmanRegular}
        showBackButton={true}
        onBackPress={() => router.back()}
        titleAlign="left"
        style={{
          borderBottomColor: 'transparent',
        }}
      />

      {/* Notifications List */}
      {reversedNotifications.length > 0 ? (
        <FlatList
          data={reversedNotifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={renderNotificationItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.text.primary}
              colors={[theme.colors.text.primary]}
              progressBackgroundColor={theme.colors.background.secondary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            gap: 10,
          }}
        />
      ) : (
        <Center style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <Icon
              name={iconNames.notification_badge}
              size={64}
              color={theme.colors.text.tertiary}
            />
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text
                variant="h3"
                style={{
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                }}
              >
                No Notifications
              </Text>
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          </View>
        </Center>
      )}
    </Background>
  );
}
