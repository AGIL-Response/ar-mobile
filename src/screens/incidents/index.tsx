/**
 * Incidents List Screen
 * Displays all incidents with proper navigation and floating action button
 */

import React, { useEffect } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IncidentListCard } from './components';
import { AppBar, Icon, Text, View, iconNames } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, useTheme } from '@/theme';
import type { Incident } from '@/api/incidents/types';

export default function IncidentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const authState = useAuthStore();
  const incidentsState = useIncidentsStore();

  const tenantId = authState.selectedTenant?.id;

  useEffect(() => {
    if (tenantId) {
      incidentsState.actions.fetchIncidents(tenantId);
    }
  }, [tenantId]);

  const handleIncidentPress = (incident: Incident) => {
    incidentsState.actions.setSelectedIncident(incident);
    router.push(`/incidents/${incident.id}`);
  };

  const handleCreateIncident = () => {
    router.push('/incidents/create');
  };

  const renderIncident = ({ item }: { item: Incident }) => (
    <IncidentListCard incident={item} onPress={handleIncidentPress} />
  );

  const renderEmpty = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
      }}
    >
      <Text
        variant="h4"
        style={{
          color: theme.colors.text.muted,
          marginBottom: 8,
        }}
      >
        No incidents found
      </Text>
      <Text
        variant="body"
        style={{
          color: theme.colors.text.muted,
          textAlign: 'center',
        }}
      >
        Create your first incident by tapping the + button
      </Text>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <AppBar
        title="Incidents"
        showBackButton={true}
        onBackPress={() => router.back()}
        safeArea
      />

      {/* Content */}
      <View style={{ flex: 1 }}>
        {incidentsState.isLoading && incidentsState.incidents.length === 0 ? (
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
                color: theme.colors.text.muted,
              }}
            >
              Loading incidents...
            </Text>
          </View>
        ) : (
          <FlatList
            data={incidentsState.incidents}
            renderItem={renderIncident}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: 16,
              gap: 12,
              paddingBottom: 100, // Space for FAB
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateIncident}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
          width: 56,
          height: 56,
          backgroundColor: Palette.primary,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
      >
        <Icon
          name={iconNames.plus}
          size={24}
          color={Palette.white}
        />
      </TouchableOpacity>
    </View>
  );
}
