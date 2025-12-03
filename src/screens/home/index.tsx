/**
 * Home Screen
 * Main dashboard with tab-based view switching
 */

import React, { useEffect, useMemo, useState } from 'react';

import { Background, View } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useTasksStore } from '@/stores/tasks';
import { useMapStore } from '@/stores/map';

import { AppHeader } from './components/app-header';
import { FlatView } from './components/flat-view';
// import { LocationStatus } from './components/location-status';
import { MapView } from './components/map-view';
import { TabSelector } from './components/tab-selector';

export default function HomeScreen() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenant?.id);
  const selectedTeamName = useAuthStore((state) => state.selectedTeam?.name || '');
  const userId = useAuthStore((state) => state.user?.id);
  const teamId = useAuthStore((state) => state.selectedTeam?.id);

  const fetchTasks = useTasksStore((state) => state.actions.fetchTasks);
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);

  const mapFocusIncidentId = useMapStore((state) => state.mapFocusIncidentId);
  const mapFocusUserId = useMapStore((state) => state.mapFocusUserId);
  const flatViewFocusUserId = useMapStore((state) => state.flatViewFocusUserId);

  const clearAllFocus = useMapStore((state) => state.actions.clearAllFocus);

  const [activeTab, setActiveTab] = useState<'flat' | 'map'>('flat');

  useEffect(() => {
    if (userId && teamId) {
      fetchTasks({
        assigneeId: userId,
        teamId: teamId,
      });
    }

    // Fetch incidents when tenant is available
    // Use default query params (offset=0, limit=100, sort={}, count=false)
    // Optional filters: type, status, search can be added if needed
    if (selectedTenantId) {
      fetchIncidents({});
    }
  }, [userId, teamId, selectedTenantId]);

  useEffect(() => {
    if (mapFocusIncidentId && activeTab !== 'map') {
      setActiveTab('map');
    } else if (mapFocusUserId && activeTab !== 'map') {
      setActiveTab('map');
    } else if (flatViewFocusUserId && activeTab !== 'flat') {
      setActiveTab('flat');
    }
  }, [mapFocusIncidentId, mapFocusUserId, flatViewFocusUserId]);

  const handleTabChange = (tab: 'flat' | 'map') => {
    clearAllFocus();
    setActiveTab(tab);
  };

  return (
    <Background>
      {/* App Bar */}
      <AppHeader title={selectedTeamName} />

      {/* Tab Selector */}
      <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Location Status */}
      {/* <LocationStatus /> */}

      {/* Content - ViewPager */}
      <View style={{ flex: 1 }}>
        {activeTab === 'flat' ? <FlatView /> : <MapView />}
      </View>

      {/* Floating Action Button */}
      {/* <FloatingActionButton /> */}
    </Background>
  );
}
