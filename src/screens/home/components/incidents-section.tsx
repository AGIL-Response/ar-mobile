/**
 * Incidents Section Component
 * Display incident cards and reports
 */

import React from 'react';

import { Text, View } from '@/components';
import { useTheme } from '@/theme';

export function IncidentsSection() {
  const theme = useTheme();

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
          style={{
            color: '#dee2e6', // Light gray from Figma
            fontSize: 16,
            lineHeight: 18,
            fontWeight: '600',
            fontFamily: 'Manrope-SemiBold',
          }}
        >
          Incidents
        </Text>
        <Text
          style={{
            color: '#1068eb', // Blue from Figma
            fontSize: 12,
            lineHeight: 18,
            fontWeight: '600',
            textAlign: 'center',
            fontFamily: 'Manrope-SemiBold',
          }}
        >
          View All
        </Text>
      </View>

      <Text
        style={{
          color: theme.colors.text.secondary,
          fontSize: 14,
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        Incident cards section will be implemented here
      </Text>
    </View>
  );
}
