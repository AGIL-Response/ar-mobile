/**
 * Flat View Component
 * Contains Members and Incidents sections for the flat view tab
 */

import React from 'react';
import { ScrollView } from 'react-native';

import { View } from '@/components';

import { IncidentsSection } from './incidents-section';
import { MembersSection } from './members-section';

export function FlatView() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ 
        padding: 16, 
        gap: 40,
        paddingBottom: 100, // Extra space for FAB
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Members Section */}
      <MembersSection />

      {/* Incidents Section */}
      <IncidentsSection />
    </ScrollView>
  );
}
