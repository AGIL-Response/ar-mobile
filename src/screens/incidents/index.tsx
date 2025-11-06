/**
 * Incidents List Screen
 * Displays all incidents with proper navigation and floating action button
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IncidentListCard } from './components';
import { AppBar, Icon, Text, View, iconNames } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';
import { Palette, useTheme } from '@/theme';
import type { Incident } from '@/api/incidents/types';

export default function IncidentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const authState = useAuthStore();
  const incidentsState = useIncidentsStore();
  const usersState = useUsersStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch incidents with default parameters
    incidentsState.actions.fetchIncidents({
      type: 'fire',
      status: 'reported',
    });

    // Fetch team members if we have a selected team
    const teamId = authState.selectedTeam?.id;
    if (teamId) {
      usersState.actions.fetchTeamMembers(teamId);
    }
  }, [authState.selectedTeam?.id]);

  const handleIncidentPress = (incident: Incident) => {
    incidentsState.actions.setSelectedIncident(incident);
    router.push(`/incidents/${incident.id}`);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh incidents data
      await incidentsState.actions.fetchIncidents({
        type: 'fire',
        status: 'reported',
      });

      // Refresh team members if we have a selected team
      const teamId = authState.selectedTeam?.id;
      if (teamId) {
        await usersState.actions.fetchTeamMembers(teamId);
      }
    } catch (error) {
      console.error('Failed to refresh incidents:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [incidentsState.actions, usersState.actions, authState.selectedTeam?.id]);

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
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.secondary,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          variant="h3"
          style={{
            color: theme.colors.text.primary,
            fontFamily: theme.fonts.goldmanRegular,
            backgroundColor: theme.colors.background.secondary,
          }}
        >
          Incidents
        </Text>
        <View
          style={{
            gap: 8,
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {/* Search Icon */}
          <View
            style={{
              width: 32,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              height: 32,
              overflow: 'hidden',
              backgroundColor: theme.colors.background.overlay,
            }}
          >
            <Icon
              name={iconNames.search}
              size={16}
              color={theme.colors.text.icon}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <View
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
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
    </SafeAreaView>
  );
}
