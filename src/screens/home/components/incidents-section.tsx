/**
 * Incidents Section Component
 * Display incident cards and reports
 */

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';

import type { Incident } from '@/api/incidents/types';
import { Text, View } from '@/components';
import { IncidentListCard } from '@/screens/incidents/components';
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, useTheme } from '@/theme';

export function IncidentsSection() {
  const theme = useTheme();
  const router = useRouter();
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
  const setSelectedIncident = useIncidentsStore((state) => state.actions.setSelectedIncident);
  const isLoading = useIncidentsStore((state) => state.isLoading);
  const incidents = useIncidentsStore((state) => state.incidents);

  useEffect(() => {
    // Fetch incidents with default parameters (fire type, reported status)
    fetchIncidents({
      type: 'fire',
      status: 'reported'
    });
  }, []);

  const handleViewAll = () => {
    router.navigate('/incidents');
  };

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
    router.navigate(`/incidents/${incident.id}`);
  };

  if (isLoading && incidents.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            variant="h4"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            Incidents
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text
              variant="caption"
              style={{
                color: Palette.primary,
              }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <Text variant="body" style={{ color: theme.colors.text.muted }}>
          Loading incidents...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          variant="h4"
          style={{
            color: theme.colors.text.primary,
          }}
        >
          Incidents
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text
            variant="caption"
            style={{
              color: Palette.primary,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Incident Cards */}
      <View style={{ gap: 12 }}>
        {incidents.length === 0 ? (
          <Text variant="body" style={{ color: theme.colors.text.muted }}>
            No incidents found
          </Text>
        ) : (
          incidents.slice(0, 3).map((incident) => (
            <IncidentListCard
              key={incident.id}
              incident={incident}
              onPress={handleIncidentPress}
            />
          ))
        )}
      </View>
    </View>
  );
}
