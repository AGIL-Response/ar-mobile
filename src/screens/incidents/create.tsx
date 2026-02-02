/**
 * Create Incident Screen
 * Form for creating new incidents
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { filesApi } from '@/api';
import type { CreateIncidentRequest } from '@/api/incidents/types';
import { typeIncidentOptions } from '@/api/incidents/types';
import {
  AppBar,
  Background,
  Button,
  Icon,
  iconNames,
  Input,
  LocalAttachmentsGallery,
  Text,
  View,
  type LocalAttachment,
} from '@/components';
import { Select } from '@/components/select';
import { TextArea } from '@/components/textarea';
import { useLocation } from '@/lib/hooks/use-location';
import { useSafeAreaInsets } from '@/lib/hooks';
import { useIncidentsStore } from '@/stores/incidents';
import { useTheme } from '@/theme';

import { LocationPermissionScreen } from './components';
import { IncidentUploadModel } from './components/incident-upload-model';
interface CreateIncidentForm {
  name: string;
  description: string;
  type: string;
  attachments: LocalAttachment[];
}

export const getMimeTypeFromUri = (uri: string) => {
  if (!uri) return 'image/jpeg';
  const ext = uri.split('.').pop() || 'jpg';
  if (ext === 'mp4' || ext === 'mov') {
    return 'video/mp4';
  }
  return 'image/jpeg';
};

export default function CreateIncidentScreen() {
  const theme = useTheme();
  const { bottomInset } = useSafeAreaInsets();
  const router = useRouter();
  const createIncident = useIncidentsStore((state) => state.actions.createIncident);
  const location = useLocation();
  const ref = React.useRef<any>(null);
  const [form, setForm] = useState<CreateIncidentForm>({
    name: '',
    description: '',
    type: '',
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    if (ref.current) {
      await ref.current.takePhoto();
    }
  };

  const handleUploadPhoto = async () => {
    if (ref.current) {
      await ref.current.uploadPhoto();
    }
  };

  // Check location permission on mount
  useEffect(() => {
    if (location.hasPermission === null) {
      // Still checking permissions, wait
      return;
    }
    if (location.hasPermission === false) {
      // Permission not granted, will show permission screen
      return;
    }
    if (location.hasPermission === true && !location.coordinates) {
      // Permission granted but no location yet, get it
      location.actions.getCurrentLocation();
    }
  }, [location.hasPermission]);

  const handleInputChange = (
    field: keyof CreateIncidentForm,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestPermission = async () => {
    await location.actions.requestPermission();
  };

  const handleCancelPermission = () => {
    router.back();
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Incident name is required');
      return false;
    }
    if (!form.type) {
      Alert.alert('Error', 'Incident type is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Create the incident
      const incidentData: CreateIncidentRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type as any,
        location: {
          coordinates: location.coordinates || [103.8198, 1.3521, 0], // Use device location or fallback
        },
      };

      const createdIncident =
        await createIncident(incidentData);

      // Step 2: Upload image if selected

      if (form.attachments && form.attachments.length > 0 && createdIncident) {
        try {
          for (const attachment of form.attachments) {
            const ext = attachment.uri.split('.').pop() || 'jpg';
            const mimeType =
              attachment.mimeType || getMimeTypeFromUri(attachment.uri);
            await filesApi.uploadIncidentAttachment({
              incidentId: createdIncident.id,
              fileUri: attachment.uri,
              fileName: `incident_${createdIncident.id}_${Date.now()}.${ext}`,
              mimeType,
            });
          }
        } catch (uploadError) {
          console.warn(
            'Failed to upload image, but incident was created:',
            uploadError
          );
          // Don't fail the entire process if image upload fails
        }
      }

      const successMessage =
        form.attachments && form.attachments.length > 0
          ? 'Incident created and attachments uploaded successfully'
          : 'Incident created successfully';

      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => router.replace('/incidents' as any) },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create incident';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentPicked = useCallback(
    (uri: string, mimeType: string) => {
      const newAttachment: LocalAttachment = {
        id: `local_${Date.now()}_${Math.random()}`,
        uri,
        mimeType,
      };
      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment],
      }));
    },
    []
  );

  const handleRemoveAttachment = (attachmentId: string) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  // Show loading while checking permissions
  if (location.hasPermission === null) {
    return (
      <Background>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Checking location permissions...
          </Text>
        </View>
      </Background>
    );
  }

  // Show permission screen if permission is not granted
  if (!location.hasPermission) {
    return (
      <Background>
        <AppBar
          title="New Incident"
          showBackButton={true}
          onBackPress={() => router.back()}
          safeArea={true}
          titleAlign="left"
          style={{ borderBottomWidth: 0 }}
        />
        <LocationPermissionScreen
          onRequestPermission={handleRequestPermission}
          onCancel={handleCancelPermission}
          isLoading={location.isLoading}
          error={location.error}
        />
      </Background>
    );
  }

  // Show main create incident form
  return (
    <Background>
      <AppBar
        title="Create Incidents"
        titleFontFamily={theme.fonts.goldmanRegular}
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea={true}
        titleAlign="left"
      />

      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Incident Name */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.disabled,
              marginBottom: 4,
            }}
          >
            Incident Name
          </Text>
          <Input
            placeholder="Enter incident"
            value={form.name}
            onChangeText={(text) => handleInputChange('name', text)}
            autoCapitalize="sentences"
            size="small"
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.disabled,
              marginBottom: 4,
            }}
          >
            Description
          </Text>
          <TextArea
            placeholder="Placeholder"
            value={form.description}
            onChangeText={(text) => handleInputChange('description', text)}
            autoCapitalize="sentences"
            size="small"
          />
        </View>

        {/* Incident Type */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.disabled,
              marginBottom: 4,
            }}
          >
            Incident Type
          </Text>
          <Select
            placeholder="Select"
            value={form.type}
            onValueChange={(value) => handleInputChange('type', String(value))}
            options={typeIncidentOptions.filter(opt => opt.value !== 'all')}
            size="small"
          />
        </View>

        {/* Image Upload */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.disabled,
              marginBottom: 4,
            }}
          >
            Attachments
          </Text>

          {/* Take Photo/Video and Choose from Gallery Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Button
              variant="solid"
              size="medium"
              title="Take Photo/Video"
              onPress={handleTakePhoto}
              disabled={isSubmitting}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.button.borderPrimary,
                backgroundColor: theme.colors.button.ghost,
              }}
              colorVariant="secondary"
              icon={
                <Icon
                  name={iconNames.camera}
                  size={20}
                  color={theme.colors.text.primary}
                />
              }
            />

            <Button
              variant="solid"
              size="medium"
              title="Choose from Gallery"
              onPress={handleUploadPhoto}
              disabled={isSubmitting}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.button.borderPrimary,
                backgroundColor: theme.colors.button.ghost,
              }}
              colorVariant="secondary"
              icon={
                <Icon
                  name={iconNames.upload}
                  size={20}
                  color={theme.colors.text.primary}
                />
              }
            />
          </View>

          {/* Image Preview Area */}
          {form.attachments.length > 0 && (
            <LocalAttachmentsGallery
              attachments={form.attachments}
              onRemove={handleRemoveAttachment}
              gap={12}
            />
          )}

          <IncidentUploadModel
            ref={ref}
            onAttachmentPicked={handleAttachmentPicked}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={{
          padding: 24,
          paddingBottom: 24 + bottomInset,
          flexDirection: 'row',
          gap: 16,
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderColor: theme.colors.surface.border,
        }}
      >
        <Button
          variant="solid"
          size="medium"
          title="Cancel"
          onPress={() => router.back()}
          disabled={isSubmitting}
          style={{
            flex: 1,
          }}
          colorVariant="disabled"
        />
        <Button
          variant="solid"
          size="medium"
          title={isSubmitting ? 'Creating...' : 'Create Incident'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{ flex: 1 }}
          colorVariant="secondary"
        />
      </View>
    </Background>
  );
}
