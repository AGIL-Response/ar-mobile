/**
 * Incidents Section Component
 * Display incident cards and reports
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Icon, Text, View, iconNames } from '@/components';
import { Palette, useTheme } from '@/theme';

type IncidentSeverity = 'high' | 'medium' | 'low';

interface Incident {
  id: string;
  title: string;
  reporter: string;
  location: string;
  time: string;
  severity: IncidentSeverity;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Chemical Spill',
    reporter: 'Laila Johnson',
    location: 'Industrial Zone Alpha, 123 Main St',
    time: '12 min ago',
    severity: 'high',
  },
  {
    id: '2',
    title: 'Chemical Spill',
    reporter: 'Laila Johnson',
    location: 'Industrial Zone Alpha, 123 Main St',
    time: '12 min ago',
    severity: 'high',
  },
  {
    id: '3',
    title: 'Chemical Spill',
    reporter: 'Laila Johnson',
    location: 'Industrial Zone Alpha, 123 Main St',
    time: '12 min ago',
    severity: 'low',
  },
];

const getSeverityColor = (severity: IncidentSeverity): string => {
  switch (severity) {
    case 'high':
      return '#dc2626'; // Red
    case 'medium':
      return '#f59e0b'; // Orange
    case 'low':
      return '#f97316'; // Orange-red
    default:
      return '#6b7280'; // Gray
  }
};

const getSeverityLabel = (severity: IncidentSeverity): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export function IncidentsSection() {
  const theme = useTheme();

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
        <TouchableOpacity>
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
        {mockIncidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={{
              backgroundColor: theme.colors.surface.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.colors.surface.border,
            }}
          >
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
                }}
              >
                {incident.title}
              </Text>
              <View
                style={{
                  backgroundColor: getSeverityColor(incident.severity),
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
                  {getSeverityLabel(incident.severity)}
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              {/* Reporter */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name={iconNames.user} size={16} color={theme.colors.text.muted} />
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  {incident.reporter}
                </Text>
              </View>

              {/* Location */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name={iconNames.home} size={16} color={theme.colors.text.muted} />
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.text.secondary,
                    flex: 1,
                  }}
                >
                  {incident.location}
                </Text>
              </View>

              {/* Time */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name={iconNames.home} size={16} color={theme.colors.text.muted} />
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  {incident.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
