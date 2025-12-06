/**
 * IncidentListCard Component
 * Reusable incident card that can be used in both home section and incidents list
 * (Named IncidentListCard to avoid conflict with the existing IncidentCard variant in card.tsx)
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import type { Incident } from '@/api/incidents/types';
import { Icon, iconNames, Text, View } from '@/components';
import { useUsersStore } from '@/stores/users';
import { useTheme } from '@/theme';
import { FontFamilies } from '@/lib/fonts';
import {
  getPriorityBackgroundColor,
  getPriorityColor,
  getPriorityLabel,
  mapIncidentTypeToSeverity,
} from '../detail';

interface IncidentCardProps {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

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
  const users = useUsersStore((state) => state.users);

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
      const user = users.find(
        (user) => user.id === incident.createdBy
      );
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
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: theme.colors.surface.border,
      }}
    >
      {/* Header Row */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text
          variant="h4"
          style={{
            flex: 1,
            color: theme.colors.text.primary,
            fontFamily: FontFamilies.goldmanRegular,
          }}
        >
          {incident.name}
        </Text>
        <View
          style={{
            backgroundColor: getPriorityBackgroundColor(displaySeverity),
            paddingHorizontal: 6,
            paddingTop: 8,
            paddingBottom: 4,
            borderRadius: 4,
          }}
        >
          <Text
            variant="bodySmall"
            style={{ color: getPriorityColor(displaySeverity) }}
          >
            {getPriorityLabel(displaySeverity)}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View
        style={{
          gap: 8,
          borderRadius: 12,
        }}
      >
        {/* Reporter/Created By */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Icon
              name={iconNames.user_edit}
              size={16}
              color={theme.colors.text.icon}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.text.secondary }}
            >
              Reported by
            </Text>
          </View>
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
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Icon
                name={iconNames.location}
                size={16}
                color={theme.colors.text.icon}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.text.secondary }}
              >
                Location
              </Text>
            </View>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.text.secondary,
                flex: 1,
                textAlign: 'right',
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
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Icon
              name={iconNames.clock}
              size={16}
              color={theme.colors.text.icon}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.text.secondary }}
            >
              Reported at
            </Text>
          </View>
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
