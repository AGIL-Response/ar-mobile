/**
 * Incidents Section Component
 * Display incident cards and reports
 */

import { RelativePathString, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import type { Incident } from '@/api/incidents/types';
import { Text, View } from '@/components';
import { IncidentListCard } from '@/screens/incidents/components';
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, type Theme, useTheme } from '@/theme';

export function IncidentsSection() {
  const theme = useTheme();
  const router = useRouter();
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);
  const setSelectedIncident = useIncidentsStore((state) => state.actions.setSelectedIncident);
  const isLoading = useIncidentsStore((state) => state.isLoading);
  const incidents = useIncidentsStore((state) => state.incidents);
  const styles = createStyles(theme, isLoading && incidents.length === 0, incidents.length === 0);

  useEffect(() => {
    // Fetch incidents with default parameters (fire type, reported status)
    fetchIncidents({
      type: 'fire',
      status: 'reported'
    });
  }, []);

  const handleViewAll = () => {
    router.navigate('/incidents' as RelativePathString);
  };

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
    router.navigate(`/incidents/${incident.id}` as RelativePathString);
  };

  if (isLoading && incidents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text variant="h4" style={styles.title}>
            Incidents
          </Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text variant="caption" style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <Text variant="body" style={styles.loadingText}>
          Loading incidents...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text variant="h4" style={styles.title}>
          Incidents
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text variant="caption" style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Incident Cards */}
      <View style={styles.incidentsContainer}>
        {incidents.length === 0 ? (
          <Text variant="body" style={styles.emptyText}>
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

const createStyles = (theme: Theme, isLoading: boolean, isEmpty: boolean) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.primary,
    },
    viewAll: {
      color: Palette.primary,
    },
    loadingText: {
      color: theme.colors.text.muted,
    },
    incidentsContainer: {
      gap: 12,
    },
    emptyText: {
      color: theme.colors.text.muted,
    },
  });
