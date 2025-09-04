/**
 * Home Screen
 * Main dashboard with members and incidents sections
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Screen, View } from '@/components';
import { useTheme } from '@/theme';

import { AppHeader } from './components/app-header';
import { FloatingActionButton } from './components/floating-action-button';
import { IncidentsSection } from './components/incidents-section';
import { MembersSection } from './components/members-section';
import { TabSelector } from './components/tab-selector';
import useAuthStore from '@/stores/auth';

export default function HomeScreen() {
  const theme = useTheme();
  const currentRealm = useAuthStore(state => state.currentRealm) || '';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Screen>
        {/* App Bar */}
        <AppHeader title={currentRealm} />

        {/* Tab Selector */}
        <TabSelector />

        {/* Content */}
        <View style={{ flex: 1, padding: 16, gap: 40 }}>
          {/* Members Section */}
          <MembersSection />

          {/* Incidents Section */}
          <IncidentsSection />
        </View>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </Screen>
    </SafeAreaView>
  );
}
