import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { IncidentsSection } from './incidents-section';
import { createIncident } from '@/lib/mock-data-tests';

const incidentsStoreModule = require('@/stores/incidents');
const usersStoreModule = require('@/stores/users');
const authStoreModule = require('@/stores/auth');
const { __pushMock: pushMock } = require('expo-router');

describe('IncidentsSection', () => {
  let mockIncidentsState: any;
  let mockUsersState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    authStoreModule.useAuthStore.mockImplementation(() => ({
      selectedTenant: { id: 'tenant-123' },
    }));

    mockIncidentsState = {
      incidents: [],
      isLoading: false,
      actions: {
        fetchIncidents: jest.fn(),
        setSelectedIncident: jest.fn(),
      },
    };

    mockUsersState = {
      users: [],
      actions: {
        fetchUsers: jest.fn(),
      },
    };

    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
    usersStoreModule.useUsersStore.mockImplementation(() => mockUsersState);
  });

  it('fetches incidents (and users if missing) on mount', async () => {
    render(<IncidentsSection />);

    await waitFor(() => {
      expect(mockIncidentsState.actions.fetchIncidents).toHaveBeenCalledWith(
        'tenant-123'
      );
    });

    await waitFor(() => {
      expect(mockUsersState.actions.fetchUsers).toHaveBeenCalledWith(
        'tenant-123'
      );
    });
  });

  it('does not refetch users when already loaded', async () => {
    mockUsersState.users = [{ id: '1' }];

    render(<IncidentsSection />);

    await waitFor(() => {
      expect(mockIncidentsState.actions.fetchIncidents).toHaveBeenCalledWith(
        'tenant-123'
      );
    });

    expect(mockUsersState.actions.fetchUsers).not.toHaveBeenCalled();
  });

  it('shows loading state when incidents are being fetched', () => {
    mockIncidentsState.isLoading = true;

    render(<IncidentsSection />);

    expect(screen.getByText('Loading incidents...')).toBeTruthy();
  });

  it('renders an empty state when there are no incidents', () => {
    render(<IncidentsSection />);

    expect(screen.getByText('No incidents found')).toBeTruthy();
  });

  it('renders up to three incident cards', () => {
    mockIncidentsState.incidents = [
      createIncident({ id: '1', name: 'Incident One' }),
      createIncident({ id: '2', name: 'Incident Two' }),
      createIncident({ id: '3', name: 'Incident Three' }),
      createIncident({ id: '4', name: 'Incident Four' }),
    ];

    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );

    render(<IncidentsSection />);

    expect(screen.queryByText('Incident Four')).toBeNull();
    expect(screen.getByText('Incident One')).toBeTruthy();
    expect(screen.getByText('Incident Two')).toBeTruthy();
    expect(screen.getByText('Incident Three')).toBeTruthy();
  });

  it('navigates to incidents list when View All is pressed', () => {
    render(<IncidentsSection />);

    fireEvent.press(findPressableParent(screen.getByText('View All')));

    expect(pushMock).toHaveBeenCalledWith('/incidents');
  });

  it('navigates to incident detail when an incident card is pressed', () => {
    const incident = createIncident({ id: '99', name: 'Power outage' });
    const setSelectedIncidentMock = jest.fn();
    mockIncidentsState.incidents = [incident];
    mockIncidentsState.actions.setSelectedIncident = setSelectedIncidentMock;

    incidentsStoreModule.useIncidentsStore.mockClear();
    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );

    render(<IncidentsSection />);

    fireEvent.press(screen.getByText('Power outage'));

    expect(setSelectedIncidentMock).toHaveBeenCalledWith(incident);
    expect(pushMock).toHaveBeenCalledWith('/incidents/99');
  });
});
