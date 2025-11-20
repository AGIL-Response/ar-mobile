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
import { useIncidentsStore } from '@/stores/incidents';
import { Palette, Theme, useTheme } from '@/theme';
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
      if (!type) return '';
      const typeStr = String(type)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return typeStr;
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
  return iconNames.incident;
};

export const getIncidentTypeColor = (theme: Theme) => {
  return theme.colors.semantic.white;
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
    router.navigate('/' as any);
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
    onPress,
  }: {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
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
            textDecorationLine: onPress ? 'underline' : 'none',
          }}
          onPress={onPress}
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
          title="Incident Detail"
          showBackButton
          onBackPress={handleBackPress}
          titleFontFamily={theme.fonts.goldmanRegular}
          titleAlign="left"
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
          title="Incident Detail"
          showBackButton
          onBackPress={handleBackPress}
          titleFontFamily={theme.fonts.goldmanRegular}
          titleAlign="left"
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
          title="Incident Detail"
          showBackButton
          onBackPress={handleBackPress}
          titleFontFamily={theme.fonts.goldmanRegular}
          titleAlign="left"
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

  const pillFields = [
    {
      label: 'Type',
      value: getTypeLabel(incident?.type),
      backgroundColor: getTypeBackgroundColor(incident?.type),
      textColor: getTypeColor(incident?.type),
    },
    {
      label: 'Priority',
      value: getPriorityLabel(displaySeverity),
      backgroundColor: getPriorityBackgroundColor(displaySeverity),
      textColor: getPriorityColor(displaySeverity),
    },
    {
      label: 'Status',
      value: getStatusLabel(incident?.status),
      backgroundColor: getStatusBackgroundColor(incident?.status),
      textColor: getStatusColor(incident?.status),
    },
  ];

  const rowFields = [
    {
      icon: iconNames.user_plus,
      label: 'Reported by',
      value: getCreatedByName(),
    },
    {
      icon: iconNames.location,
      label: 'Location',
      value: incident.location?.coordinates
        ? `${incident.location.coordinates[1]?.toFixed(6)}, ${incident.location.coordinates[0]?.toFixed(6)}`
        : 'Not specified',
      onPress: handleViewLocation,
    },
    {
      icon: iconNames.clock_fast_forward,
      label: 'Reported at',
      value: formatDate(incident.createdAt),
    },
  ];

  return (
    <Background>
      <AppBar
        title="Incident Detail"
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
            <View
              style={{
                width: 28,
                height: 28,
                backgroundColor: theme.colors.semantic.error,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon
                name={getIncidentTypeIcon(incident.type)}
                size={16}
                color={getIncidentTypeColor(theme)}
              />
            </View>
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
            {pillFields.map((field) => (
              <Pill
                key={field.label}
                label={field.value}
                backgroundColor={field.backgroundColor}
                textColor={field.textColor}
              />
            ))}
          </View>
        </View>

        {/* Details Section */}
        <View
          style={{
            marginHorizontal: 16,
          }}
        >
          {/* Reported by */}
          {rowFields.map((field) => (
            <InfoRow
              key={field.label}
              icon={field.icon}
              label={field.label}
              value={field.value}
              onPress={field.onPress}
            />
          ))}
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
