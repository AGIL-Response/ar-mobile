/**
 * IncidentListCard Component
 * Reusable incident card that can be used in both home section and incidents list
 * (Named IncidentListCard to avoid conflict with the existing IncidentCard variant in card.tsx)
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { Incident, IncidentSeverity } from '@/api/incidents/types';
import { Icon, iconNames,Text, View } from '@/components';
import { useUsersStore } from '@/stores/users';
import { Palette, useTheme } from '@/theme';

interface IncidentCardProps {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

const getSeverityColor = (severity?: IncidentSeverity): string => {
  switch (severity) {
    case 'high':
      return '#dc2626'; // Red
    case 'medium':
      return '#f59e0b'; // Orange
    case 'low':
      return '#f97316'; // Orange-red
    default:
      return '#f59e0b'; // Default to medium/orange for unknown
  }
};

const getSeverityLabel = (severity?: IncidentSeverity): string => {
  if (!severity) return 'Medium'; // Default display
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

// Helper function to map incident type to severity for display
const mapIncidentTypeToSeverity = (type: string): IncidentSeverity => {
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

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export function IncidentListCard({ incident, onPress }: IncidentCardProps) {
  const theme = useTheme();
  const usersState = useUsersStore();

  const handlePress = () => {
    onPress?.(incident);
  };

  // Use provided severity or map from incident type
  const displaySeverity =
    incident.severity || mapIncidentTypeToSeverity(incident.type);

  // Get user name from the users store
  const getCreatedByName = () => {
    if (incident.reportedBy) {
      return incident.reportedBy;
    }
    
    if (incident.createdBy) {
      const user = usersState.users.find(user => user.id === incident.createdBy);
      if (user) {
        return user.fullName || user.username || 'Unknown User';
      }
    }
    
    return 'Unknown Reporter';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        backgroundColor: theme.colors.surface.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.surface.border,
      }}
    >
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <Text
          variant="h4"
          style={{
            color: theme.colors.text.primary,
            flex: 1,
            marginRight: 8,
          }}
        >
          {incident.name}
        </Text>
        <View
          style={{
            backgroundColor: getSeverityColor(displaySeverity),
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: Palette.white,
            }}
          >
            {getSeverityLabel(displaySeverity)}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={{ gap: 8 }}>
        {/* Reporter/Created By */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon
            name={iconNames.user}
            size={16}
            color={theme.colors.text.muted}
          />
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            {getCreatedByName()}
          </Text>
        </View>

        {/* Location */}
        {incident.description && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon
              name={iconNames.location}
              size={16}
              color={theme.colors.text.muted}
            />
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.secondary,
                flex: 1,
              }}
            >
              {incident.description}
            </Text>
          </View>
        )}

        {/* Time */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon
            name={iconNames.clock}
            size={16}
            color={theme.colors.text.muted}
          />
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.text.secondary,
            }}
          >
            {formatTimeAgo(incident.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
