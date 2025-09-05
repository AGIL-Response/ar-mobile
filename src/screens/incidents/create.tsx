/**
 * Create Incident Screen
 * Form for creating new incidents
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBar, Button, Input, Text, View } from '@/components';
import { Select } from '@/components/select';
import { TextArea } from '@/components/textarea';
import { LocationPermissionScreen } from './components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useLocation } from '@/lib/hooks/use-location';
import { useTheme } from '@/theme';
import type { CreateIncidentRequest } from '@/api/incidents/types';

interface CreateIncidentForm {
  name: string;
  description: string;
  type: string;
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

  const [form, setForm] = useState<CreateIncidentForm>({
    name: '',
    description: '',
    type: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (field: keyof CreateIncidentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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

    const tenantId = authState.selectedTenant?.id;
    if (!tenantId) {
      Alert.alert('Error', 'No tenant selected');
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData: CreateIncidentRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type as any,
        status: 'NEW',
        location: {
          coordinates: location.coordinates || [103.8198, 1.3521, 0], // Use device location or fallback
        },
      };

      await incidentsState.actions.createIncident(tenantId, incidentData);
      
      Alert.alert(
        'Success',
        'Incident created successfully',
        [{ text: 'OK', onPress: () => router.replace('/incidents') }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create incident';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking permissions
  if (location.hasPermission === null) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
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
      </SafeAreaView>
    );
  }

  // Show permission screen if permission is not granted
  if (!location.hasPermission) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <AppBar
          title="New Incident"
          showBackButton={true}
          onBackPress={() => router.back()}
          safeArea={false}
        />
        <LocationPermissionScreen
          onRequestPermission={handleRequestPermission}
          onCancel={handleCancelPermission}
          isLoading={location.isLoading}
          error={location.error}
        />
      </SafeAreaView>
    );
  }

  // Show main create incident form
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <AppBar
        title="New Incident"
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea={false}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Incident Name */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="label"
            style={{
              color: theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Incident Name
          </Text>
          <Input
            placeholder="Enter incident name"
            value={form.name}
            onChangeText={(text) => handleInputChange('name', text)}
            autoCapitalize="sentences"
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 16 }}>
          <Text
            variant="label"
            style={{
              color: theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <TextArea
            placeholder="Describe the incident details..."
            value={form.description}
            onChangeText={(text) => handleInputChange('description', text)}
            autoCapitalize="sentences"
          />
        </View>

        {/* Incident Type */}
        <View>
          <Text
            variant="label"
            style={{
              color: theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Incident Type *
          </Text>
          <Select
            placeholder="Select incident type"
            value={form.type}
            onValueChange={(value) => handleInputChange('type', String(value))}
            options={incidentTypes}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={{
          padding: 16,
          paddingBottom: 24,
        }}
      >
        <Button
          variant="solid"
          size="medium"
          title={isSubmitting ? 'Creating...' : 'Create Incident'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{ width: '100%' }}
        />
      </View>
    </SafeAreaView>
  );
}
