/**
 * Incident Detail Screen
 * Detailed view of a specific incident
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import type { Incident, IncidentSeverity } from '@/api/incidents/types';
import {
  AppBar,
  AttachmentsGallery,
  Background,
  Center,
  Icon,
  iconNames,
  Text,
  View,
} from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, useTheme } from '@/theme';
import { useUsersStore } from '@/stores/users';

export const mapIncidentTypeToSeverity = (
  type?: Incident['type']
): IncidentSeverity => {
  switch (type?.toLowerCase()) {
    case 'emergency':
      return 'high';
    case 'maintenance':
    case 'security':
      return 'medium';
    case 'health':
    case 'environmental':
      return 'low';
    default:
      return 'medium';
  }
};

export const getTypeLabel = (type: Incident['type']) => {
  switch (type) {
    case 'fire':
      return 'Fire';
    case 'emergency':
      return 'Emergency';
    case 'maintenance':
      return 'Maintenance';
    case 'security':
      return 'Security';
    case 'health':
      return 'Health';
    case 'environmental':
      return 'Environmental';
    default:
      const typeStr = String(type);
      return typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
  }
};

export const getTypeColor = (type: Incident['type']) => {
  switch (type) {
    case 'fire':
      return Palette.error;
    case 'emergency':
      return Palette.warning;
    case 'maintenance':
      return Palette.primary500;
    case 'security':
      return Palette.warning;
    case 'health':
      return Palette.primary500;
    case 'environmental':
      return Palette.primary500;
    default:
      return Palette.primary500;
  }
};

export const getTypeBackgroundColor = (type: Incident['type']) => {
  switch (type) {
    case 'fire':
      return Palette.errorAlt;
    case 'emergency':
      return Palette.warningAlt;
    case 'maintenance':
      return Palette.backgroundSecondary;
    case 'security':
      return Palette.warningAlt;
    case 'health':
      return Palette.backgroundSecondary;
    case 'environmental':
      return Palette.backgroundSecondary;
    default:
      return Palette.backgroundSecondary;
  }
};

export const getPriorityColor = (severity?: IncidentSeverity) => {
  switch (severity) {
    case 'high':
      return Palette.error;
    case 'medium':
      return Palette.warning;
    case 'low':
      return Palette.primary500;
    default:
      return Palette.primary500;
  }
};

export const getPriorityBackgroundColor = (severity?: IncidentSeverity) => {
  switch (severity) {
    case 'high':
      return Palette.errorAlt;
    case 'medium':
      return Palette.warningAlt;
    case 'low':
      return Palette.backgroundSecondary;
    default:
      return Palette.backgroundSecondary;
  }
};

export const getIncidentTypeIcon = (type: Incident['type']) => {
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

export const getIncidentTypeColor = (type: Incident['type']) => {
  switch (type) {
    case 'maintenance':
      return Palette.primary500;
    case 'emergency':
      return Palette.error;
    case 'security':
      return Palette.warning;
    case 'health':
      return Palette.primary500;
    case 'environmental':
      return Palette.primary500;
    default:
      return Palette.primary500;
  }
};

export const getStatusColor = (status: Incident['status']) => {
  switch (status) {
    case 'RESOLVED':
      return Palette.success;
    case 'IN_PROGRESS':
      return Palette.primary500;
    case 'CLOSED':
      return Palette.primary500;
    case 'NEW':
    default:
      return Palette.warning;
  }
};

export const getStatusBackgroundColor = (status: Incident['status']) => {
  switch (status) {
    case 'RESOLVED':
      return Palette.successAlt;
    case 'IN_PROGRESS':
      return Palette.backgroundSecondary;
    case 'CLOSED':
      return Palette.backgroundSecondary;
    case 'NEW':
    default:
      return Palette.warningAlt;
  }
};

export const getStatusLabel = (status: Incident['status']) => {
  switch (status) {
    case 'NEW':
      return 'Reported';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    case 'reported':
      return 'Reported';
    default:
      return String(status).replace('_', ' ');
  }
};
export const getPriorityLabel = (severity?: IncidentSeverity) => {
  if (!severity) return 'Medium';
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export default function IncidentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const incidentsState = useIncidentsStore();
  const usersState = useUsersStore();
  const router = useRouter();

  const incident = incidentsState.selectedIncident;
  const incidentId = id as string;
  const displaySeverity =
    incident?.severity || mapIncidentTypeToSeverity(incident?.type);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleViewLocation = () => {
    const coordinates = incident?.location?.coordinates;
    if (!incident || !coordinates) {
      return;
    }

    incidentsState.actions.setMapFocusIncident(incident.id);
    router.push('/' as any);
  };

  const getCreatedByName = () => {
    if (incident?.reportedBy) {
      return incident.reportedBy;
    }

    if (incident?.createdBy) {
      const user = usersState.users.find(
        (user) => user.id === incident.createdBy
      );
      if (user) {
        return user.fullName || user.username || 'Unknown User';
      }
    }

    return 'Unknown Reporter';
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon
          name={icon}
          size={20}
          color={theme.colors.text.icon}
          style={{ marginRight: 8 }}
        />
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.text.secondary,
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.text.secondary,
            textAlign: 'right',
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  const Pill = ({
    label,
    backgroundColor,
    textColor = theme.colors.semantic.white,
  }: {
    label: string;
    backgroundColor: string;
    textColor?: string;
  }) => (
    <View
      style={{
        backgroundColor,
        borderRadius: 4,
        marginRight: 8,
        paddingHorizontal: 8,
        paddingTop: 6,
        paddingBottom: 2,
      }}
    >
      <Text
        variant="caption"
        style={{
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (incidentsState.isLoadingDetails) {
    return (
      <Background
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      >
        <AppBar
          title="Incidents Detail"
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
          title="Incidents Detail"
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
          title="Incidents Detail"
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
        title="Incidents Detail"
        showBackButton
        onBackPress={handleBackPress}
        testID="back-button"
        titleFontFamily={theme.fonts.goldmanRegular}
        titleAlign="left"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Title Section with Icon and Tags */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Icon
              name={getIncidentTypeIcon(incident.type)}
              size={20}
              color={getIncidentTypeColor(incident.type)}
            />
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.goldmanRegular,
                marginLeft: 8,
              }}
            >
              {incident.name}
            </Text>
          </View>

          {/* Tags Row */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <Pill
              label={getTypeLabel(incident.type)}
              textColor={getTypeColor(incident.type)}
              backgroundColor={getTypeBackgroundColor(incident.type)}
            />
            <Pill
              label={getPriorityLabel(displaySeverity)}
              textColor={getPriorityColor(displaySeverity)}
              backgroundColor={getPriorityBackgroundColor(displaySeverity)}
            />
            <Pill
              label={getStatusLabel(incident.status)}
              textColor={getStatusColor(incident.status)}
              backgroundColor={getStatusBackgroundColor(incident.status)}
            />
          </View>
        </View>

        {/* Details Section */}
        <View
          style={{
            marginHorizontal: 16,
          }}
        >
          {/* Reported by */}
          <InfoRow
            icon={iconNames.user_plus}
            label="Reported by"
            value={getCreatedByName()}
          />

          {/* Location */}
          <InfoRow
            icon={iconNames.location}
            label="Location"
            value={
              incident.location?.coordinates
                ? `${incident.location.coordinates[1]?.toFixed(6)}, ${incident.location.coordinates[0]?.toFixed(6)}`
                : 'Not specified'
            }
          />

          {/* Reported at */}
          <InfoRow
            icon={iconNames.clock_fast_forward}
            label="Reported at"
            value={formatDate(incident.createdAt)}
          />
        </View>

        {/* Action Section (if incident has tasks) */}
        {incident.description && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text
              variant="h4"
              style={{
                color: theme.colors.text.tertiary,
                fontFamily: theme.fonts.goldmanRegular,
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.text.tertiary,
              }}
            >
              {incident.description}
            </Text>
          </View>
        )}

        {/* Attachments Section */}
        {incident.fileIds && incident.fileIds.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <AttachmentsGallery fileIds={incident.fileIds} gap={12} />
          </View>
        )}
      </ScrollView>
    </Background>
  );
}
