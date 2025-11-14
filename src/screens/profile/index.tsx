/**
 * Profile Screen
 * User profile and settings
 */

import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  AppBar,
  Avatar,
  Background,
  Icon,
  iconNames,
  Text,
  ThemeToggle,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';
import images from '@assets/images';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const router = useRouter();

  const user = authState.user;
  const selectedTenant = authState.selectedTenant;

  // Get user display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.username || 'User';
  };

  // Get user role/title
  const getUserRole = () => {
    if (user?.roles && user.roles.length > 0) {
      const role = user.roles[0];
      const teamName =
        selectedTenant?.displayName || selectedTenant?.name || 'Team';
      return `${role}, ${teamName}`;
    }
    return selectedTenant?.displayName || selectedTenant?.name || 'Team Member';
  };

  const handleNotificationPress = () => {
    // TODO: Navigate to notification settings
    console.log('Navigate to notification settings');
  };

  const handleAccountSettingsPress = () => {
    // TODO: Navigate to account settings
    console.log('Navigate to account settings');
  };

  const settingsItems = [
    {
      id: 'notifications',
      icon: iconNames.notification_badge,
      title: 'Notification Preferences',
      onPress: handleNotificationPress,
      showChevron: true,
    },
    {
      id: 'theme',
      icon: iconNames.sun,
      title: 'Dark Mode',
      onPress: null, // Handled by toggle
      showChevron: false,
      rightComponent: <ThemeToggle size="small" />,
    },
    {
      id: 'account',
      icon: iconNames.settings,
      title: 'Account Settings',
      onPress: handleAccountSettingsPress,
      showChevron: true,
    },
  ];

  return (
    <Background>
      <AppBar
        title="Profile"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 32,
            paddingHorizontal: 16,
          }}
        >
          {/* Avatar */}
          <Avatar
            source={images.avatar_image}
            size="xl"
            fallback={getDisplayName()}
            style={{ marginBottom: 16 }}
          />

          {/* User Name */}
          <Text
            variant="h2"
            style={{
              color: theme.colors.text.primary,
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {getDisplayName()}
          </Text>

          {/* User Role/Title */}
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            {getUserRole()}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.primary,
              marginBottom: 12,
            }}
          >
            Settings
          </Text>

          <View
            style={{
              backgroundColor: theme.colors.surface.card,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.colors.surface.border,
              overflow: 'hidden',
            }}
          >
            {settingsItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    opacity: item.onPress ? 1 : 1, // Keep opacity consistent
                  }}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.colors.surface.input,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      color={theme.colors.text.secondary}
                    />
                  </View>

                  {/* Title */}
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      style={{
                        color: theme.colors.text.primary,
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {/* Right Content */}
                  {item.rightComponent ? (
                    item.rightComponent
                  ) : item.showChevron ? (
                    <Icon
                      name={iconNames.arrow_left} // We'll rotate this or add a right arrow
                      size={16}
                      color={theme.colors.text.secondary}
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                  ) : null}
                </TouchableOpacity>

                {/* Divider */}
                {index < settingsItems.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.surface.border,
                      marginLeft: 60, // Align with text (32px icon + 12px margin + 16px padding)
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </Background>
  );
}
