/**
 * App Header Component
 * Pixel-perfect implementation matching Figma design
 */

import React, { useEffect } from 'react';

import { Avatar, Icon, iconNames, Text, View } from '@/components';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '@/stores/auth';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationsStore } from '@/stores/notifications';

interface AppHeaderProps {
  title: string;
  showRightSection?: boolean;
}

export function AppHeader({ title, showRightSection = true }: AppHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const authState = useAuthStore();
  const router = useRouter();
  const notificationsState = useNotificationsStore();

  const { unreadCount } = notificationsState;
  const user = authState.user;

  useEffect(() => {
    notificationsState.actions.getUnreadCount();
  }, [notificationsState.actions]);

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
      {showRightSection && (
        <View
          style={{
            gap: 8,
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity onPress={() => router.navigate('/notifications')}>
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
                size={20}
                color={theme.colors.text.icon}
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: theme.colors.semantic.error,
                    borderRadius: 5,
                    width: 10,
                    height: 10,
                    borderWidth: 1,
                    borderColor: theme.colors.semantic.white,
                  }}
                ></View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.navigate('/profile')}>
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
              <Avatar
                fileId={user?.avatarId}
                size="small"
                style={{
                  borderWidth: 2,
                  borderColor: theme.colors.semantic.white,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
