/**
 * Home Screen
 * Main dashboard with tab-based view switching
 */

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Screen, View } from '@/components';
import useAuthStore from '@/stores/auth';
import { useTheme } from '@/theme';

import { AppHeader } from './components/app-header';
import { FlatView } from './components/flat-view';
import { FloatingActionButton } from './components/floating-action-button';
import { LocationStatus } from './components/location-status';
import { MapView } from './components/map-view';
import { TabSelector } from './components/tab-selector';

export default function HomeScreen() {
  const theme = useTheme();
  const selectedTenant = useAuthStore(state => state.selectedTenant);
  const [activeTab, setActiveTab] = useState<'flat' | 'map'>('flat');

  const handleTabChange = (tab: 'flat' | 'map') => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <Screen>
        {/* App Bar */}
        <AppHeader title={selectedTenant?.displayName || selectedTenant?.name || ''} />

        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Location Status */}
        <LocationStatus />

        {/* Content - ViewPager */}
        <View style={{ flex: 1 }}>
          {activeTab === 'flat' ? <FlatView /> : <MapView />}
        </View>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </Screen>
    </SafeAreaView>
  );
}
