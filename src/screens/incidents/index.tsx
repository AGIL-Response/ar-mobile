/**
 * Incidents List Screen
 * Displays all incidents with proper navigation and floating action button
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';

import { IncidentListCard } from './components';
import { Text, View, Background } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import type { Incident } from '@/api/incidents/types';
import { AppHeader } from "@/screens/home/components/app-header";

export default function IncidentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const selectedTeamId = useAuthStore((state) => state.selectedTeam?.id);
  const incidents = useIncidentsStore((state) => state.incidents);
  const isLoading = useIncidentsStore((state) => state.isLoading);
  const setSelectedIncident = useIncidentsStore((state) => state.actions.setSelectedIncident);
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
  const fetchTeamMembers = useUsersStore((state) => state.actions.fetchTeamMembers);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch incidents with default parameters
    fetchIncidents({});

    if (selectedTeamId) {
      fetchTeamMembers(selectedTeamId);
    }
  }, [selectedTeamId]);

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
    router.navigate(`/incidents/${incident.id}` as RelativePathString);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh incidents data
      await fetchIncidents({
        type: 'fire',
        status: 'reported',
      });

      // Refresh team members if we have a selected team
      if (selectedTeamId) {
        await fetchTeamMembers(selectedTeamId);
      }
    } catch (error) {
      console.error('Failed to refresh incidents:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchIncidents, fetchTeamMembers, selectedTeamId]);

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
    <Background>
      <AppHeader />

      {/* Content */}
      <View style={{ flex: 1 }}>
        {isLoading && incidents.length === 0 ? (
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
            data={incidents}
            renderItem={renderIncident}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              padding: 16,
              gap: 12,
              paddingBottom: 100, // Space for FAB
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.text.primary}
                colors={[theme.colors.text.primary]}
                progressBackgroundColor={theme.colors.background.secondary}
              />
            }
          />
        )}
      </View>
    </Background>
  );
}
