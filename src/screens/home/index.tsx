/**
 * Home Screen
 * Main dashboard with tab-based view switching
 */

import React, { useEffect, useState } from 'react';

import { Background } from '@/components';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useTasksStore } from '@/stores/tasks';

import { AppHeader } from './components/app-header';
import { FlatView } from './components/flat-view';
// import { LocationStatus } from './components/location-status';

export default function HomeScreen() {
  const selectedTenantId = useAuthStore((state) => state.selectedTenant?.id);
  const userId = useAuthStore((state) => state.user?.id);
  const teamId = useAuthStore((state) => state.selectedTeam?.id);

  const fetchTasks = useTasksStore((state) => state.actions.fetchTasks);
  const fetchIncidents = useIncidentsStore((state) => state.actions.fetchIncidents);


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


  return (
    <Background>
      {/* App Bar */}
      <AppHeader />

      {/* flat view */}
      <FlatView />

    </Background>
  );
}
