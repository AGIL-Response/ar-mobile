/**
 * Create Incident Screen
 * Form for creating new incidents
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { filesApi } from '@/api';
import type { CreateIncidentRequest } from '@/api/incidents/types';
import {
  AppBar,
  Background,
  Button,
  Icon,
  iconNames,
  Input,
  SafeAreaView,
  Text,
  useModal,
  View,
} from '@/components';
import { Select } from '@/components/select';
import { TextArea } from '@/components/textarea';
import { useLocation } from '@/lib/hooks/use-location';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, useTheme } from '@/theme';

import { LocationPermissionScreen } from './components';
import { IncidentUploadModel } from './components/incident-upload-model';
import images from '@assets/images';

interface CreateIncidentForm {
  name: string;
  description: string;
  type: string;
  images: string;
}

const incidentTypes = [
  { label: 'Emergency', value: 'emergency' },
  { label: 'Fire', value: 'fire' },
  { label: 'Medical', value: 'medical' },
  { label: 'Security', value: 'security' },
  { label: 'Traffic', value: 'traffic' },
];

export default function CreateIncidentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const authState = useAuthStore();
  const incidentsState = useIncidentsStore();
  const location = useLocation();
  const { ref, present, dismiss } = useModal();
  const [form, setForm] = useState<CreateIncidentForm>({
    name: '',
    description: '',
    type: '',
    images: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reusable Take Photo button component
  const TakePhotoButton = ({ isOverlay = false }: { isOverlay?: boolean }) => (
    <TouchableOpacity
      onPress={handleOpenModal}
      activeOpacity={0.8}
      style={
        isOverlay
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }
          : undefined
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: Palette.blue1100,
          backgroundColor: Palette.buttonGhostDef,
        }}
      >
        <Icon
          name={iconNames.camera}
          size={18}
          color={theme.colors.semantic.white}
        />
        <Text variant="body" style={{ color: theme.colors.semantic.white }}>
          Take a Photo
        </Text>
      </View>
    </TouchableOpacity>
  );

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
  }, [location.hasPermission, location.coordinates]);

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
        await incidentsState.actions.createIncident(incidentData);

      // Step 2: Upload image if selected
      let imageUploadSuccess = false;
      if (form.images && createdIncident) {
        try {
          await filesApi.uploadIncidentAttachment({
            incidentId: createdIncident.id,
            fileUri: form.images,
            fileName: `incident_${createdIncident.id}_${Date.now()}.jpg`,
            mimeType: 'image/jpeg',
          });
          console.log(
            'Image uploaded successfully for incident:',
            createdIncident.id
          );
          imageUploadSuccess = true;
        } catch (uploadError) {
          console.warn(
            'Failed to upload image, but incident was created:',
            uploadError
          );
          // Don't fail the entire process if image upload fails
        }
      }

      const successMessage = form.images
        ? imageUploadSuccess
          ? 'Incident created and image uploaded successfully'
          : 'Incident created successfully, but image upload failed'
        : 'Incident created successfully';

      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => router.replace('/incidents') },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create incident';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    present();
  };

  const handleImagePicked = useCallback(
    (image: string) => {
      setForm((prev) => ({ ...prev, images: image }));
      dismiss();
    },
    [dismiss, setForm]
  );

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
          safeArea={false}
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
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      <AppBar
        title="Incidents"
        titleFontFamily={theme.fonts.goldmanRegular}
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea={true}
        titleAlign="left"
        style={{ borderBottomWidth: 0 }}
      />

      <Background>
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
                color: theme.colors.text.muted,
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
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 16 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.muted,
                marginBottom: 4,
              }}
            >
              Label
            </Text>
            <TextArea
              placeholder="Placeholder"
              value={form.description}
              onChangeText={(text) => handleInputChange('description', text)}
              autoCapitalize="sentences"
            />
          </View>

          {/* Incident Type */}
          <View style={{ marginBottom: 16 }}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.muted,
                marginBottom: 4,
              }}
            >
              Incident Name
            </Text>
            <Select
              placeholder="Select"
              value={form.type}
              onValueChange={(value) =>
                handleInputChange('type', String(value))
              }
              options={incidentTypes}
            />
          </View>

          {/* Image Upload */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                // width: '100%',
                height: 250,
                // borderRadius: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.colors.surface.border,
                    backgroundColor: theme.colors.background.primary,
                  }}
                >
                  {form.images ? (
                    <View
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Image
                        source={{ uri: form.images }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <TakePhotoButton isOverlay={true} />
                    </View>
                  ) : (
                    <>
                      {/* Placeholder Icon Background */}
                      <View
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Image
                          source={images.file_upload_placeholder}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>
                      <TakePhotoButton isOverlay={true} />
                    </>
                  )}
                </View>
              </View>
            </View>

            <IncidentUploadModel ref={ref} onImagePicked={handleImagePicked} />
          </View>
        </ScrollView>
      </Background>

      {/* Submit Button */}
      <View
        style={{
          padding: 24,
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
            borderWidth: 2,
            borderColor: theme.colors.border.primary,
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
    </SafeAreaView>
  );
}
