/**
 * Profile Detail Screen
 * Detailed view of user profile information
 */

import { router } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  AppBar,
  Avatar,
  Background,
  Icon,
  iconNames,
  Text,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';

interface ProfileFieldProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const ProfileField = ({ label, value }: ProfileFieldProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.text.placeholder,
          paddingBottom: 4,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.text.secondary,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

export default function ProfileDetailScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const user = authState.user;

  const handleBackPress = () => {
    router.back();
  };

  const handleEditPress = () => {
    router.navigate('/(app)/profile/create' as any);
  };

  const profileFields = [
    {
      label: 'Full Name',
      value: user?.fullName || 'N/A',
    },
    {
      label: 'Email',
      value: user?.email || 'N/A',
    },
    {
      label: 'Username',
      value: user?.username || 'N/A',
    },
  ];

  return (
    <Background>
      <AppBar
        title="Profile Detail"
        showBackButton
        onBackPress={handleBackPress}
        titleAlign="left"
        titleFontFamily={theme.fonts.goldmanRegular}
        rightContent={
          <TouchableOpacity
            onPress={handleEditPress}
            style={{
              padding: 8,
            }}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Icon
              name={iconNames.change}
              size={20}
              color={theme.colors.text.icon}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 32,
            paddingHorizontal: 16,
          }}
        >
          <Avatar
            fileId={user?.avatarId}
            size="xl"
            fallback={user?.fullName || 'N/A'}
            style={{
              borderWidth: 2,
              borderColor: theme.colors.semantic.white,
            }}
          />
        </View>

        {/* Profile Information Section */}
        <View
          style={{
            marginHorizontal: 16,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: theme.colors.background.border,
            backgroundColor: theme.colors.background.input,
            overflow: 'hidden',
            paddingVertical: 8,
          }}
        >
          {profileFields.map((field) => (
            <ProfileField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </View>
      </ScrollView>
    </Background>
  );
}
