/**
 * Notifications Screen
 * Display user notifications and alerts
 */

import React, { useCallback, useEffect, useState } from 'react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { notifications, isLoading, error, actions } = notificationsState;

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
        return theme.colors.primary;
      case 'incident_assigned':
        return theme.colors.semantic.warning;
      case 'task_completed':
        return theme.colors.semantic.success;
      case 'incident_resolved':
        return theme.colors.semantic.success;
      case 'team_update':
        return theme.colors.primary;
      case 'system_maintenance':
      default:
        return theme.colors.semantic.warning;
    }
  };

  // Handle notification press
  const handleNotificationPress = useCallback(
    async (notification: UserNotification) => {
      try {
        // Mark as read if it's unread
        if (notification.status === 'unread') {
          await actions.markNotificationRead(
            notification.notificationId,
            'read'
          );
        }

        // Handle navigation based on notification type and metadata
        const { type, metadata } = notification;
        console.log('Notification pressed:', type, metadata);

        // TODO: Add navigation logic based on notification type
        // Example:
        // if (type === 'task_assigned' && metadata.entityType === 'task') {
        //   router.push(`/task/${metadata.id}`);
        // } else if (type === 'incident_assigned' && metadata.entityType === 'incident') {
        //   router.push(`/incidents/${metadata.id}`);
        // }
      } catch (error) {
        console.error('Failed to handle notification press:', error);
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
    const isRead = item.status === 'read';

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={{
          backgroundColor: isRead
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.text.tertiary,
          padding: 16,
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
          <View style={{ flex: 1, gap: 4 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: isRead ? '400' : '600',
                  flex: 1,
                }}
              >
                {item.metadata?.name || 'Notification'}
              </Text>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.text.secondary,
                  marginLeft: 8,
                }}
              >
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>

            <Text
              variant="caption"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 18,
              }}
            >
              {item.message}
            </Text>

            {/* Actor info */}
            {item.metadata?.actor && (
              <Text
                variant="caption"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: 11,
                }}
              >
                From: {item.metadata.actor.fullName}
              </Text>
            )}

            {/* Unread indicator */}
            {!isRead && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.primary,
                  position: 'absolute',
                  top: 0,
                  right: -4,
                }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Get unread count
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  // Show loading state
  if (isLoading && notifications.length === 0) {
    return (
      <Background>
        <AppBar title="Notifications" />
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
        <AppBar title="Notifications" />
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
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text
                variant="caption"
                style={{
                  color: theme.colors.primary,
                  fontWeight: '600',
                }}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
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

      {/* Unread Count Badge (if any) */}
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            right: 16,
            backgroundColor: theme.colors.semantic.error,
            borderRadius: 12,
            minWidth: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 8,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 12,
            }}
          >
            {unreadCount}
          </Text>
        </View>
      )}
    </Background>
  );
}
