/**
 * Change Password Screen
 * Allows users to update their account password
 */

import React, { useState } from 'react';

import { useRouter } from 'expo-router';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';

import {
  AppBar,
  Background,
  Button,
  Icon,
  iconNames,
  Input,
  Text,
  View,
} from '@/components';
import { useSafeAreaInsets } from '@/lib/hooks';
import { useTheme } from '@/theme';

interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onChangeText: (text: string) => void;
  showToggle?: boolean;
  error?: string;
}

const PasswordField = ({
  label,
  placeholder,
  value,
  showToggle,
  isVisible,
  onToggleVisibility,
  onChangeText,
  error,
}: PasswordFieldProps) => {
  const theme = useTheme();

  return (
    <View style={{ gap: 4 }}>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.text.disabled,
        }}
      >
        {label}
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.semantic.error }}
        >
          *
        </Text>
      </Text>
      <Input
        size="small"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isVisible}
        error={error}
        rightIcon={
          showToggle ? (
            <TouchableOpacity onPress={onToggleVisibility}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.text.icon }}
              >
                {isVisible ? (
                  <Icon
                    name={iconNames.eye}
                    size={16}
                    color={theme.colors.text.disabled}
                  />
                ) : (
                  <Icon
                    name={iconNames.eye_off}
                    size={16}
                    color={theme.colors.text.disabled}
                  />
                )}
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
    </View>
  );
};

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const { bottomInset } = useSafeAreaInsets();
  const router = useRouter();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm your new password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with actual change password API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Password change error:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
        <View style={{ paddingHorizontal: 16, gap: 20 }}>
          <View style={{ gap: 8 }}>
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.goldmanRegular,
              }}
            >
              Choose a New Password
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              Enter and confirm your new password to regain access
            </Text>
          </View>

          <PasswordField
            label="Old Password"
            placeholder="Enter your current password"
            value={formData.oldPassword}
            showToggle
            isVisible={visibility.old}
            onToggleVisibility={() =>
              setVisibility((prev) => ({ ...prev, old: !prev.old }))
            }
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, oldPassword: text }))
            }
            error={errors.oldPassword}
          />

          <PasswordField
            label="New Password"
            placeholder="Enter a new password"
            value={formData.newPassword}
            showToggle
            isVisible={visibility.new}
            onToggleVisibility={() =>
              setVisibility((prev) => ({ ...prev, new: !prev.new }))
            }
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, newPassword: text }))
            }
            error={errors.newPassword}
          />

          <PasswordField
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={formData.confirmPassword}
            isVisible={visibility.confirm}
            onToggleVisibility={() =>
              setVisibility((prev) => ({ ...prev, confirm: !prev.confirm }))
            }
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, confirmPassword: text }))
            }
            error={errors.confirmPassword}
          />
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
          title="Save"
          variant="solid"
          size="medium"
          onPress={handleSave}
          disabled={isSaving}
          colorVariant="secondary"
          fullWidth
        />
      </View>
    </Background>
  );
}
