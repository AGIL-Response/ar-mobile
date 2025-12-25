/**
 * Edit Profile Screen
 * Form for editing user profile information
 */

import React, { useState } from 'react';
import DateTimePicker, {
  type AndroidNativeProps,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useMediaLibraryPermission } from '@/lib/media-permissions';

import {
  AppBar,
  Avatar,
  Background,
  Button,
  Icon,
  iconNames,
  Input,
  Select,
  Text,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/theme';

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

export default function EditProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.actions.updateUser);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    description: user?.description || '',
    gender: '',
    birthdate: '',
    phoneNumber: '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBirthdatePickerVisible, setIsBirthdatePickerVisible] =
    useState(false);
  const verifyMediaPermission = useMediaLibraryPermission();

  const handleBackPress = () => {
    router.back();
  };

  const handleChangeAvatar = async () => {
    try {
      const hasPermission = await verifyMediaPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to update your avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleBirthdateChange: AndroidNativeProps['onChange'] = (
    _event,
    selectedDate
  ) => {
    setIsBirthdatePickerVisible(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        birthdate: selectedDate.toISOString(),
      });
    }
  };

  const openBirthdatePicker = () => {
    setIsBirthdatePickerVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const updatedUser = await updateUser(user?.id as string, {
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        description: formData.description,
        avatarId: avatarUri ? avatarUri : user?.avatarId || '',
        updatedAt: user?.updatedAt || '',
      });

      if (updatedUser) {
        Alert.alert(
          'Profile Updated',
          'Your profile information has been saved successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Background>
      <AppBar
        title="Edit Profile"
        showBackButton
        onBackPress={handleBackPress}
        titleAlign="left"
        titleFontFamily={theme.fonts.goldmanRegular}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 32,
            paddingHorizontal: 16,
            position: 'relative',
          }}
        >
          <Avatar
            fileId={avatarUri ? undefined : user?.avatarId}
            size="xl"
            fallback={user?.fullName || 'N/A'}
            style={{
              borderWidth: 2,
              borderColor: theme.colors.semantic.white,
            }}
            source={avatarUri ? { uri: avatarUri } : undefined}
          />

          <TouchableOpacity
            onPress={handleChangeAvatar}
            activeOpacity={1}
            style={{
              position: 'absolute',
              bottom: 28,
              right: '50%',
              marginRight: -32,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.background.button,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture"
          >
            <Icon
              name={iconNames.camera}
              size={16}
              color={theme.colors.text.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Form Fields Section */}
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.disabled,
              }}
            >
              Full Name
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.semantic.error }}
              >
                *
              </Text>
            </Text>
            <Input
              size="small"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              error={errors.fullName}
              required
            />
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.text.disabled,
                }}
              >
                Gender
              </Text>
              <Select
                size="small"
                placeholder="Select gender"
                options={genderOptions}
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value as string })
                }
              />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.text.disabled,
                }}
              >
                Birthdate
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openBirthdatePicker}
              >
                <Input
                  size="small"
                  placeholder="Select birthdate"
                  value={
                    formData.birthdate
                      ? formatDate(new Date(formData.birthdate))
                      : ''
                  }
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 4 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.disabled,
              }}
            >
              Phone Number
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.semantic.error }}
              >
                *
              </Text>
            </Text>

            <Input
              size="small"
              placeholder="+1 (123)456-7890"
              value={formData.phoneNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, phoneNumber: text })
              }
              error={errors.phoneNumber}
              required
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.disabled,
              }}
            >
              Email
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.semantic.error }}
              >
                *
              </Text>
            </Text>

            <Input
              size="small"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              required
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.disabled,
              }}
            >
              Username
            </Text>
            <Input
              size="small"
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
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

      {isBirthdatePickerVisible && (
        <DateTimePicker
          value={formData.birthdate ? new Date(formData.birthdate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleBirthdateChange}
          maximumDate={new Date()}
        />
      )}
    </Background>
  );
}
