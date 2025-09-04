/**
 * Profile Screen
 * User profile and settings
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Center, Screen, Text, ThemeToggle, View } from '@/components';
import useAuthStore from '@/stores/auth';
import { useTheme } from '@/theme';

import { ProfileHeader } from './components/profile-header';

export default function ProfileScreen() {
  const theme = useTheme();
  const authState = useAuthStore();

  const handleLogout = () => {
    authState.actions.logout();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Screen>
        {/* Header */}
        <ProfileHeader />

        {/* Content */}
        <View style={{ flex: 1, padding: 16 }}>
          <Center style={{ flex: 1 }}>
            <Text
              variant="h1"
              style={{
                color: theme.colors.text.primary,
                textAlign: 'center',
                marginBottom: theme.spacing.gap.md,
              }}
            >
              Profile
            </Text>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: theme.spacing.gap.xl,
              }}
            >
              User profile and settings will be added here
            </Text>

            {/* Theme Toggle Demo */}
            <View style={{ marginBottom: theme.spacing.gap.lg }}>
              <Text
                variant="label"
                style={{
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  marginBottom: theme.spacing.gap.sm,
                }}
              >
                Theme Settings
              </Text>
              <ThemeToggle size="medium" />
            </View>

            {/* Logout Button */}
            <Button
              title="Logout"
              variant="outline"
              colorVariant="error"
              onPress={handleLogout}
              style={{ marginTop: theme.spacing.gap.xl }}
            />
          </Center>
        </View>
      </Screen>
    </SafeAreaView>
  );
}
