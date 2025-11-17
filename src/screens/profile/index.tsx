/**
 * Profile Screen
 * User profile and settings
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  AppBar,
  Avatar,
  Background,
  Button,
  CenteredModal,
  Icon,
  iconNames,
  Text,
  ThemeToggle,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const router = useRouter();

  const user = authState.user;
  const selectedTenant = authState.selectedTenant;
  const [isLogoutModalVisible, setIsLogoutModalVisible] =
    React.useState(false);
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

  const handleProfileDetailsPress = () => {
    router.push('/(app)/profile/detail' as any);
  };

  const handleChangePasswordPress = () => {
    router.push('/(app)/profile/change-password' as any);
  };

  const handleAccountSettingsPress = () => {
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    authState.actions.logout();
    setIsLogoutModalVisible(false);
    router.back();
  };

  const settingsItems = [
    {
      id: 'profile',
      icon: iconNames.user,
      title: 'Profile Details',
      onPress: handleProfileDetailsPress,
      showChevron: true,
    },
    {
      id: 'change-password',
      icon: iconNames.lock,
      title: 'Change Password',
      onPress: handleChangePasswordPress,
      showChevron: true,
    },
    {
      id: 'logout',
      icon: iconNames.log_out,
      title: 'Logout',
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
            fileId={user?.avatarId}
            size="xl"
            fallback={user?.fullName || 'N/A'}
            style={{
              marginBottom: 16,
              borderWidth: 2,
              borderColor: theme.colors.semantic.white,
            }}
          />

          {/* User Name */}
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.primary,
              textAlign: 'center',
              marginBottom: 4,
              fontFamily: theme.fonts.goldmanRegular,
            }}
          >
            {user?.fullName || 'N/A'}
          </Text>

          {/* User Role/Title */}
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            {user?.email}
          </Text>
        </View>

        {/* Settings Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: theme.colors.background.input,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.colors.background.border,
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
                    opacity: 1,
                  }}
                  onPress={item.onPress ? item.onPress : undefined}
                  disabled={!item.onPress}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      color={theme.colors.text.primary}
                    />
                  </View>

                  {/* Title */}
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {/* Right Content */}
                  {item.showChevron ? (
                    <Icon
                      name={iconNames.chevron_left} // We'll rotate this or add a right arrow
                      size={16}
                      color={theme.colors.text.primary}
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                  ) : null}
                </TouchableOpacity>

                {/* Divider */}
                {index === settingsItems.length - 2 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.button.borderSecondary,
                      marginLeft: 20, // Align with text (32px icon + 12px margin + 16px padding)
                      marginRight: 20,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      <CenteredModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        title="Log out"
        subText="Do you want to log out?"
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 16,
          }}
        >
          <Button
            title="No"
            variant="solid"
            size="medium"
            onPress={() => setIsLogoutModalVisible(false)}
            colorVariant="disabled"
            style={{ minWidth: 80 }}
          />
          <Button
            title="Yes"
            variant="solid"
            size="medium"
            onPress={handleConfirmLogout}
            colorVariant="secondary"
            style={{ minWidth: 80 }}
          />
        </View>
      </CenteredModal>
    </Background>
  );
}
