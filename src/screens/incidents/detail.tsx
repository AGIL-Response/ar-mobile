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
import { useMapStore } from '@/stores/map';

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
      const typeStr = String(type)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return typeStr;
};

export const getTypeColor = (type: Incident['type']) => {
  switch (type) {
    case 'fire':
      return Palette.error;
    case 'sos':
      return Palette.warning;
    case 'intrusion':
      return Palette.primary500;
    case 'hazardous_material':
      return Palette.primary500;
    case 'natural_disaster':
      return Palette.primary500;
    case 'technical_failure':
      return Palette.primary500;
    case 'other':
      return Palette.primary500;
    default:
      return Palette.warning;
  }
};

export const getTypeBackgroundColor = (type: Incident['type']) => {
  switch (type) {
    case 'fire':
      return Palette.errorAlt;
    case 'sos':
      return Palette.warningAlt;
    case 'intrusion':
      return Palette.backgroundSecondary;
    case 'hazardous_material':
      return Palette.backgroundSecondary;
    case 'natural_disaster':
      return Palette.backgroundSecondary;
    case 'technical_failure':
      return Palette.backgroundSecondary;
    case 'other':
      return Palette.backgroundSecondary;
    default:
      return Palette.warningAlt;
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
    case 'resolved':
      return Palette.success;
    case 'in_progress':
      return Palette.primary500;
    case 'closed':
      return Palette.primary500;
    case 'reported':
    case 'acknowledged':
    default:
      return Palette.warning;
  }
};

export const getStatusBackgroundColor = (status: Incident['status']) => {
  switch (status) {
    case 'resolved':
      return Palette.successAlt;
    case 'in_progress':
      return Palette.backgroundSecondary;
    case 'closed':
      return Palette.backgroundSecondary;
    case 'reported':
    case 'acknowledged':
    default:
      return Palette.warningAlt;
  }
};

export const getStatusLabel = (status: Incident['status']) => {
  switch (status) {
    case 'reported':
      return 'Reported';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'acknowledged':
      return 'Acknowledged';
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
  const selectedIncident = useIncidentsStore((state) => state.selectedIncident);
  const isLoadingDetails = useIncidentsStore((state) => state.isLoadingDetails);
  const error = useIncidentsStore((state) => state.error);
  const fetchIncident = useIncidentsStore((state) => state.actions.fetchIncident);
  const setSelectedIncident = useIncidentsStore((state) => state.actions.setSelectedIncident);
  const setMapFocusIncident = useMapStore((state) => state.actions.setMapFocusIncident);
  const usersState = useUsersStore();
  const router = useRouter();

  const incidentId = id as string;
  const displaySeverity =
    selectedIncident?.severity || mapIncidentTypeToSeverity(selectedIncident?.type);

  useEffect(() => {
    if (incidentId) {
      fetchIncident(incidentId);
    }

    // Clear selected incident when component unmounts
    return () => {
      setSelectedIncident(null);
    };
  }, [incidentId, fetchIncident, setSelectedIncident]);

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
    const coordinates = selectedIncident?.location?.coordinates;
    if (!selectedIncident || !coordinates) {
      return;
    }

    router.replace('/' as any);
    setMapFocusIncident(selectedIncident.id);
  };

  const getCreatedByName = () => {
    if (selectedIncident?.reportedBy) {
      return selectedIncident.reportedBy;
    }

    if (selectedIncident?.createdBy) {
      const user = usersState.users.find(
        (user) => user.id === selectedIncident.createdBy
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
        <TouchableOpacity
          onPress={onPress}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.text.secondary,
              textAlign: 'right',
              textDecorationLine: onPress ? 'underline' : 'none',
            }}
          >
            {value}
          </Text>
        </TouchableOpacity>
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

  if (isLoadingDetails) {
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

  if (error) {
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
            {error}
          </Text>
        </Center>
      </Background>
    );
  }

  if (!selectedIncident) {
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
      value: getTypeLabel(selectedIncident?.type),
      backgroundColor: getTypeBackgroundColor(selectedIncident?.type),
      textColor: getTypeColor(selectedIncident?.type),
    },
    {
      label: 'Priority',
      value: getPriorityLabel(displaySeverity),
      backgroundColor: getPriorityBackgroundColor(displaySeverity),
      textColor: getPriorityColor(displaySeverity),
    },
    {
      label: 'Status',
      value: getStatusLabel(selectedIncident?.status),
      backgroundColor: getStatusBackgroundColor(selectedIncident?.status),
      textColor: getStatusColor(selectedIncident?.status),
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
      value: selectedIncident.location?.coordinates
        ? `${selectedIncident.location.coordinates[1]?.toFixed(6)}, ${selectedIncident.location.coordinates[0]?.toFixed(6)}`
        : 'Not specified',
      onPress: handleViewLocation,
    },
    {
      icon: iconNames.clock_fast_forward,
      label: 'Reported at',
      value: formatDate(selectedIncident.createdAt),
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
                name={getIncidentTypeIcon(selectedIncident.type)}
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
              {selectedIncident.name}
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
        {selectedIncident.description && (
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
              {selectedIncident.description}
            </Text>
          </View>
        )}

        {/* Attachments Section */}
        {selectedIncident.fileIds && selectedIncident.fileIds.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <AttachmentsGallery fileIds={selectedIncident.fileIds} gap={12} />
          </View>
        )}
      </ScrollView>
    </Background>
  );
}
