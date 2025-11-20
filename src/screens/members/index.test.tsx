import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { MembersScreen } from './index';
import {
  createAuthState,
  createRole,
  createUser,
  createUsersState,
} from '@/lib/mock-data-tests';
import { AuthState } from '@/stores/auth';
import { UsersState } from '@/stores/users';
import { Router } from 'expo-router';

const routerModule = require('expo-router');
const authStoreModule = require('@/stores/auth');
const usersStoreModule = require('@/stores/users');

describe('MembersScreen', () => {
  const fetchUsersMock = jest.fn();
  const fetchUserRolesMock = jest.fn();
  const setSearchQueryMock = jest.fn();
  const routerBackMock = jest.fn();

  let useAuthStoreSpy: jest.SpyInstance<AuthState>;
  let useUsersStoreSpy: jest.SpyInstance<UsersState>;
  let useRouterSpy: jest.SpyInstance<Router>;
  let mockAuthState: AuthState;
  let mockUsersState: UsersState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthState = createAuthState({
      selectedTenant: {
        id: 'tenant-1',
        name: 'Tenant',
        displayName: 'Tenant Display',
      },
    });

    mockUsersState = createUsersState({
      users: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      actions: {
        fetchUsers: fetchUsersMock,
        fetchUserRoles: fetchUserRolesMock,
        setSearchQuery: setSearchQueryMock,
      },
    });

    useAuthStoreSpy = jest
      .spyOn(authStoreModule, 'useAuthStore')
      .mockReturnValue(mockAuthState);
    useUsersStoreSpy = jest
      .spyOn(usersStoreModule, 'useUsersStore')
      .mockReturnValue(mockUsersState);
    useRouterSpy = jest
      .spyOn(routerModule, 'useRouter')
      .mockReturnValue({ back: routerBackMock });
  });

  afterEach(() => {
    useAuthStoreSpy.mockRestore();
    useUsersStoreSpy.mockRestore();
    useRouterSpy.mockRestore();
  });

  test('fetches users on mount when tenant id exists', async () => {
    render(<MembersScreen />);

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenCalledWith('tenant-1');
    });
  });

  test('does not fetch users when tenant id is missing', async () => {
    mockAuthState.selectedTenant = null;

    render(<MembersScreen />);

    await waitFor(() => {
      expect(fetchUsersMock).not.toHaveBeenCalled();
    });
  });

  test('shows loading state when fetching users', () => {
    mockUsersState.isLoading = true;
    mockUsersState.users = [];

    render(<MembersScreen />);

    expect(screen.getByText('Loading members...')).toBeTruthy();
  });

  test('shows empty state when no members available', () => {
    render(<MembersScreen />);

    expect(screen.getByText('No members found')).toBeTruthy();
  });

  test('renders grouped members with commander section first', () => {
    const commander = createUser({
      fullName: 'Commander Jane',
      roles: [createRole({ displayName: 'Commander' })],
    });
    const member = createUser({
      fullName: 'Team',
      roles: [],
    });
    const analyst = createUser({
      fullName: 'Analyst Ann',
      roles: [createRole({ displayName: 'Analyst' })],
    });

    mockUsersState.users = [commander, member, analyst];

    render(<MembersScreen />);

    expect(screen.getByText('Commander')).toBeTruthy();
    expect(screen.getByText('Analyst')).toBeTruthy();
  });

  test('displays error message from store', () => {
    mockUsersState.error = 'Something went wrong';

    render(<MembersScreen />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  test('opens detail modal with selected user information', async () => {
    const commander = createUser({
      fullName: 'Commander Jane',
      roles: [createRole({ displayName: 'Commander' })],
    });

    mockUsersState.users = [commander];

    render(<MembersScreen />);

    expect(screen.getByText('No member selected')).toBeTruthy();

    fireEvent.press(screen.getByText('Commander Jane'));

    await waitFor(() => {
      expect(screen.getByText('Basic Info')).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getAllByText('Commander Jane')).toBeTruthy();
    });
  });
});
