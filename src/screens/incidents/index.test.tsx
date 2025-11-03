import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import {
  createAuthState,
  createIncident,
  createIncidentsState,
  createUsersState,
} from '@/lib/mock-data-tests';
import IncidentsScreen from './index';
import { AuthState } from '@/stores/auth';
import { IncidentsState } from '@/stores/incidents';
import { UsersState } from '@/stores/users';

const { __pushMock: pushMock, __backMock: backMock } = require('expo-router');
const authStoreModule = require('@/stores/auth');
const incidentsStoreModule = require('@/stores/incidents');
const usersStoreModule = require('@/stores/users');

describe('IncidentsScreen', () => {
  let mockAuthState: AuthState;
  let mockIncidentsState: IncidentsState;
  let mockUsersState: UsersState;

  beforeEach(() => {
    pushMock.mockClear();
    backMock.mockClear();

    mockAuthState = createAuthState({
      selectedTenant: { id: 'tenant-1', name: 'Tenant', displayName: 'Tenant' },
    });

    mockIncidentsState = createIncidentsState({
      incidents: [],
      isLoading: false,
      actions: {
        fetchIncidents: jest.fn(),
        setSelectedIncident: jest.fn(),
      },
    });

    mockUsersState = createUsersState({
      users: [],
      actions: {
        fetchUsers: jest.fn(),
      },
    });

    authStoreModule.useAuthStore.mockImplementation(() => mockAuthState);
    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
    usersStoreModule.useUsersStore.mockImplementation(() => mockUsersState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches incidents and users on mount when tenant id exists', async () => {
    render(<IncidentsScreen />);
    await waitFor(() => {
      expect(mockIncidentsState.actions.fetchIncidents).toHaveBeenCalledWith(
        'tenant-1'
      );
    });
    await waitFor(() => {
      expect(mockUsersState.actions.fetchUsers).toHaveBeenCalledWith(
        'tenant-1'
      );
    });
  });

  it('does not fetch when tenant is missing', async () => {
    mockAuthState.selectedTenant = null;

    render(<IncidentsScreen />);

    await waitFor(() => {
      expect(mockIncidentsState.actions.fetchIncidents).not.toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockUsersState.actions.fetchUsers).not.toHaveBeenCalled();
    });
  });

  it('shows loading indicator when fetching incidents', () => {
    mockIncidentsState.isLoading = true;
    mockIncidentsState.incidents = [];

    render(<IncidentsScreen />);

    expect(screen.getByText('Loading incidents...')).toBeTruthy();
  });

  it('shows empty state when no incidents found', () => {
    render(<IncidentsScreen />);

    expect(screen.getByText('No incidents found')).toBeTruthy();
    expect(
      screen.getByText('Create your first incident by tapping the + button')
    ).toBeTruthy();
  });

  it('renders incidents and navigates to detail on press', () => {
    const incident = createIncident({
      id: 'incident-1',
      name: 'Network outage',
    });
    mockIncidentsState.incidents = [incident];

    render(<IncidentsScreen />);

    expect(screen.getByText('Network outage')).toBeTruthy();

    fireEvent.press(findPressableParent(screen.getByText('Network outage')));

    expect(mockIncidentsState.actions.setSelectedIncident).toHaveBeenCalledWith(
      incident
    );
    expect(pushMock).toHaveBeenCalledWith('/incidents/incident-1');
  });

  it('navigates to create incident when FAB pressed', () => {
    render(<IncidentsScreen />);

    fireEvent.press(findPressableParent(screen.getAllByTestId('mock-icon')[1]));

    expect(pushMock).toHaveBeenCalledWith('/incidents/create');
  });
});
