/**
 * Home Screen
 * Main dashboard with tab-based view switching
 */

import React, { useEffect, useState } from 'react';

import { Background, View } from '@/components';
import useAuthStore from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useTasksStore } from '@/stores/tasks';
import { useTheme } from '@/theme';

import { AppHeader } from './components/app-header';
import { FlatView } from './components/flat-view';
import { FloatingActionButton } from './components/floating-action-button';
import { LocationStatus } from './components/location-status';
import { MapView } from './components/map-view';
import { TabSelector } from './components/tab-selector';
import { useUsersStore } from '@/stores/users';

export default function HomeScreen() {
  const theme = useTheme();
  const authState = useAuthStore();
  const tasksState = useTasksStore();
  const incidentsState = useIncidentsStore();
  const usersState = useUsersStore();
  const selectedTenant = authState.selectedTenant;
  const selectedTeam = authState.selectedTeam;
  const userId = authState.user?.id;
  const teamId = authState.selectedTeam?.id;
  const [activeTab, setActiveTab] = useState<'flat' | 'map'>('flat');

  // Fetch tasks and incidents when home screen mounts
  useEffect(() => {
    // Fetch tasks when user and team are available
    if (userId && teamId) {
      tasksState.actions.fetchTasks({
        assigneeId: userId,
        teamId: teamId,
      });
    }

    // Fetch incidents when tenant is available
    // Use default query params (offset=0, limit=100, sort={}, count=false)
    // Optional filters: type, status, search can be added if needed
    if (selectedTenant?.id) {
      incidentsState.actions.fetchIncidents({});
    }
  }, [userId, teamId, selectedTenant?.id]);

  useEffect(() => {
    if (incidentsState.mapFocusIncidentId && activeTab !== 'map') {
      setActiveTab('map');
    }
    if (usersState.mapFocusUserId && activeTab !== 'map') {
      setActiveTab('map');
    }
  }, [incidentsState.mapFocusIncidentId, usersState.mapFocusUserId, activeTab]);

  const handleTabChange = (tab: 'flat' | 'map') => {
    setActiveTab(tab);
  };

  return (
    <Background>
      {/* App Bar */}
      <AppHeader title={selectedTeam?.name || ''} />

      {/* Tab Selector */}
      <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Location Status */}
      <LocationStatus />

      {/* Content - ViewPager */}
      <View style={{ flex: 1 }}>
        {activeTab === 'flat' ? <FlatView /> : <MapView />}
      </View>

      {/* Floating Action Button */}
      {/* <FloatingActionButton /> */}
    </Background>
  );
}
