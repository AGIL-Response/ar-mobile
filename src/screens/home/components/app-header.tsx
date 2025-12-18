/**
 * App Header Component
 * Pixel-perfect implementation matching Figma design
 */

import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Avatar, Icon, iconNames, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth';
import { RelativePathString, useRouter } from 'expo-router';
import { useNotificationsStore } from '@/stores/notifications';
import { SosSection } from './sos-section';

export function AppHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const getUnreadCount = useNotificationsStore((state) => state.actions.getUnreadCount);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const styles = createStyles(theme, insets.top, unreadCount > 0);

  useEffect(() => {
    getUnreadCount();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.sosContainer}>
          <SosSection />
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => router.navigate('/notifications' as RelativePathString)}>
          <View style={styles.iconButton}>
            <Icon
              name={iconNames.notification_badge}
              size={20}
              color={theme.colors.text.icon}
            />
            {unreadCount > 0 && <View style={styles.badge} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate('/profile' as RelativePathString)}>
          <View style={styles.iconButton}>
            <Avatar
              fileId={user?.avatarId}
              size="small"
              style={styles.avatar}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, topInset: number, hasUnread: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: topInset + 8,
      paddingBottom: 12,
      width: '100%',
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: theme.colors.background.secondary,
    },
    leftSection: {
      flex: 1,
      gap: 8,
    },
    sosContainer: {
      maxWidth: 55,
      borderRadius: 100,
      overflow: 'hidden',
    },
    rightSection: {
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row',
    },
    iconButton: {
      width: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      height: 32,
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: theme.colors.semantic.error,
      borderRadius: 5,
      width: 10,
      height: 10,
      borderWidth: 1,
      borderColor: theme.colors.semantic.white,
    },
    avatar: {
      borderWidth: 2,
      borderColor: theme.colors.semantic.white,
    },
  });
