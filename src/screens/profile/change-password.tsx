/**
 * Change Password Screen
 * Allows users to update their account password using OAuth
 */

import React from 'react';

import { useRouter } from 'expo-router';
import { Alert, ScrollView } from 'react-native';

import {
  AppBar,
  Background,
  Button,
  Text,
  View,
} from '@/components';
import { useSafeAreaInsets, useOAuthFlow } from '@/lib/hooks';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';


export default function ChangePasswordScreen() {
  const theme = useTheme();
  const { bottomInset } = useSafeAreaInsets();
  const router = useRouter();
  const authState = useAuthStore();

  const realm = authState.selectedTenant?.name || '';

  const {
    startChangePasswordFlow,
    isReady,
    isProcessing,
  } = useOAuthFlow({
    realm,
    onSuccess: () => {
      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully. Please log in again with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
    },
    onError: (error) => {
      console.error('❌ Password change error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.'
      );
    },
    // Force logout after password change to ensure user re-authenticates
    onLogout: async () => {
      await authState.actions.logout();
    },
  });

  const handleChangePassword = async () => {
    await startChangePasswordFlow();
  };

  return (
    <Background>
      <AppBar
        title="Change Password"
        showBackButton
        onBackPress={() => router.back()}
        titleAlign="left"
        titleFontFamily={theme.fonts.goldmanRegular}
      />

      <ScrollView
        style={{ flex: 1, paddingTop: 20 }}
        contentContainerStyle={{ paddingBottom: 100 + bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.goldmanRegular,
              }}
            >
              Change Your Password
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              You will be redirected to a secure page where you can update your
              password.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.colors.utility.overlay,
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.surface.border,
            }}
          >
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 20,
              }}
            >
              • You&apos;ll be taken to a secure authentication page{'\n'}
              • Enter your new password and confirmation{'\n'}
              • Your password must meet security requirements{'\n'}
              • You&apos;ll be redirected back to home screen after completion
            </Text>
          </View>

          {isProcessing && (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.text.secondary }}
              >
                Processing...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
          paddingBottom: 24 + bottomInset,
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surface.border,
        }}
      >
        <Button
          title="Change Password"
          variant="solid"
          size="medium"
          onPress={handleChangePassword}
          disabled={!isReady || isProcessing}
          loading={isProcessing}
          colorVariant="secondary"
          fullWidth
        />
      </View>
    </Background>
  );
}
