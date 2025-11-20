import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { createAuthState, createIncident, createIncidentsState } from '@/lib/mock-data-tests';
import IncidentDetailScreen from './detail';
import { AuthState } from '@/stores/auth';
import { IncidentsState } from '@/stores/incidents';

const routerModule = require('expo-router');
const authStoreModule = require('@/stores/auth');
const incidentsStoreModule = require('@/stores/incidents');

const {
  __backMock: backMock,
  __useLocalSearchParamsMock: useLocalSearchParamsMock,
} = routerModule;

describe('IncidentDetailScreen', () => {
  let mockAuthState: AuthState;
  let mockIncidentsState: IncidentsState;
  let incident: ReturnType<typeof createIncident>;

  beforeEach(() => {
    jest.clearAllMocks();
    backMock.mockClear();
    incident = createIncident({ id: 'incident-1', name: 'Power outage' });

    useLocalSearchParamsMock.mockReturnValue({ id: incident.id });

    mockAuthState = createAuthState({
      selectedTenant: { id: 'tenant-1', name: 'Tenant', displayName: 'Tenant' },
    });

    mockIncidentsState = createIncidentsState({
      selectedIncident: incident,
      isLoadingDetails: false,
      error: null,
      actions: {
        fetchIncident: jest.fn(),
        setSelectedIncident: jest.fn(),
      },
    });

    authStoreModule.useAuthStore.mockImplementation(() => mockAuthState);
    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches incident details on mount and clears on unmount', () => {
    const { unmount } = render(<IncidentDetailScreen />);

    expect(mockIncidentsState.actions.fetchIncident).toHaveBeenCalledWith(
      'tenant-1',
      incident.id
    );

    unmount();

    expect(mockIncidentsState.actions.setSelectedIncident).toHaveBeenCalledWith(
      null
    );
  });

  it('shows loading state when details are loading', () => {
    mockIncidentsState.isLoadingDetails = true;

    render(<IncidentDetailScreen />);

    expect(screen.getByText('Loading incident details...')).toBeTruthy();
  });

  it('displays error message when store has error', () => {
    mockIncidentsState.error = 'Failed to load incident';

    render(<IncidentDetailScreen />);

    expect(screen.getByText('Failed to load incident')).toBeTruthy();
  });

  it('shows fallback when incident not found', () => {
    mockIncidentsState.selectedIncident = null;

    render(<IncidentDetailScreen />);

    expect(screen.getByText('Incident not found')).toBeTruthy();
  });

  it('renders incident details when available', () => {
    const incidentDetails = createIncident({
      id: 'incident-1',
      name: 'Security breach',
      type: 'security',
      status: 'IN_PROGRESS',
      description: 'Unauthorized access detected',
    });
    mockIncidentsState.selectedIncident = incidentDetails;

    render(<IncidentDetailScreen />);

    expect(screen.getByText('Security breach')).toBeTruthy();
    expect(screen.getByText('security Incident')).toBeTruthy();
    expect(screen.getByText('Unauthorized access detected')).toBeTruthy();
    expect(screen.getByText('IN PROGRESS')).toBeTruthy();
  });

  // it('navigates back when back button pressed', () => {
  //   render(<IncidentDetailScreen />);

  //   const backButton = findPressableParent(screen.getByTestId('back-button'));
  //   fireEvent(backButton, 'press');

  //   expect(backMock).toHaveBeenCalled();
  // });
});
