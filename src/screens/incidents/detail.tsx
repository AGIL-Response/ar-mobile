/**
 * Incident Detail Screen
 * Detailed view of a specific incident
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';

import type { Incident } from '@/api/incidents/types';
import {
  AppBar,
  Button,
  Center,
  IncidentAttachment,
  Icon,
  iconNames,
  Text,
  View,
  Background,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useTheme } from '@/theme';

export default function IncidentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const authState = useAuthStore();
  const incidentsState = useIncidentsStore();

  const selectedTenant = authState.selectedTenant;
  const incident = incidentsState.selectedIncident;
  const incidentId = id as string;

  const { actions } = incidentsState;

  useEffect(() => {
    if (incidentId) {
      actions.fetchIncident(incidentId);
    }

    // Clear selected incident when component unmounts
    return () => {
      actions.setSelectedIncident(null);
    };
  }, [incidentId, actions]);

  const handleBackPress = () => {
    router.back();
  };

  // Placeholder for potential updates/actions on incident
  const handleAction = async () => {};

  const getIncidentTypeIcon = (type: Incident['type']) => {
    switch (type) {
      case 'maintenance':
        return iconNames.settings;
      case 'emergency':
        return iconNames.notification_badge;
      case 'security':
        return iconNames.list;
      case 'health':
        return iconNames.user;
      case 'environmental':
        return iconNames.clock;
      default:
        return iconNames.list;
    }
  };

  const getIncidentTypeColor = (type: Incident['type']) => {
    switch (type) {
      case 'maintenance':
        return theme.colors.primary;
      case 'emergency':
        return theme.colors.semantic.error;
      case 'security':
        return theme.colors.semantic.warning;
      case 'health':
        return theme.colors.primary;
      case 'environmental':
        return theme.colors.text.secondary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'RESOLVED':
        return theme.colors.semantic.success;
      case 'IN_PROGRESS':
        return theme.colors.primary;
      case 'CLOSED':
        return theme.colors.text.secondary;
      case 'NEW':
      default:
        return theme.colors.semantic.warning;
    }
  };

  const getStatusLabel = (status: Incident['status']) => {
    return status.replace('_', ' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const InfoRow = ({
    icon,
    label,
    value,
    valueColor,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface.border,
      }}
    >
      <Icon
        name={icon}
        size={20}
        color={theme.colors.text.secondary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          variant="caption"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          variant="body"
          style={{
            color: valueColor || theme.colors.text.primary,
            fontWeight: '500',
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  if (incidentsState.isLoadingDetails) {
    return (
      <Background
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <AppBar
          title="Incident Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            Loading incident details...
          </Text>
        </Center>
      </Background>
    );
  }

  if (incidentsState.error) {
    return (
      <Background>
        <AppBar
          title="Incident Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.semantic.error,
              textAlign: 'center',
            }}
          >
            {incidentsState.error}
          </Text>
        </Center>
      </Background>
    );
  }

  if (!incident) {
    return (
      <Background>
        <AppBar
          title="Incident Details"
          showBackButton
          onBackPress={handleBackPress}
        />
        <Center style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Incident not found
          </Text>
        </Center>
      </Background>
    );
  }

  return (
    <Background>
      <AppBar
        title="Incident Details"
        showBackButton
        onBackPress={handleBackPress}
        testID="back-button"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header Section */}
        <View
          style={{
            backgroundColor: theme.colors.surface.card,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.surface.border,
            overflow: 'hidden',
          }}
        >
          {/* Title and Type */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${getIncidentTypeColor(incident.type)}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Icon
                  name={getIncidentTypeIcon(incident.type)}
                  size={20}
                  color={getIncidentTypeColor(incident.type)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="h3"
                  style={{
                    color: theme.colors.text.primary,
                    marginBottom: 4,
                  }}
                >
                  {incident.name}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color: theme.colors.text.secondary,
                    textTransform: 'capitalize',
                  }}
                >
                  {incident.type} Incident
                </Text>
              </View>
            </View>

            {/* Description */}
            {incident.description && (
              <Text
                variant="body"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 20,
                }}
              >
                {incident.description}
              </Text>
            )}
          </View>

          <InfoRow
            icon={iconNames.clock}
            label="Status"
            value={getStatusLabel(incident.status)}
            valueColor={getStatusColor(incident.status)}
          />

          <InfoRow
            icon={iconNames.clock}
            label="Created"
            value={formatDate(incident.createdAt)}
          />
        </View>

        {/* Attachments Section */}
        {incident.fileIds && incident.fileIds.length > 0 && (
          <View style={{ padding: 16 }}>
            <Text
              variant="h3"
              style={{
                color: theme.colors.text.primary,
                marginBottom: 12,
              }}
            >
              Attachments ({incident.fileIds.length})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {incident.fileIds.map((fileId) => (
                <IncidentAttachment key={fileId} fileId={fileId} size={100} />
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ padding: 16, gap: 12 }}>
          <Button
            title="Resolve Incident"
            variant="solid"
            size="medium"
            onPress={handleAction}
          />
        </View>
      </ScrollView>
    </Background>
  );
}
