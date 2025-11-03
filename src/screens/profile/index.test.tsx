import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import ProfileScreen from './index';
import type { AuthState } from '@/stores/auth';
import { createAuthState } from '@/lib/mock-data-tests';

const authStoreModule = require('@/stores/auth');

describe('ProfileScreen', () => {
  let useAuthStoreSpy: jest.SpyInstance<AuthState>;
  let mockAuthState: AuthState;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthState = createAuthState({
      user: {
        id: 'user-1',
        email: 'jane.doe@example.com',
        tenantId: 'tenant-1',
        realm: 'realm-1',
        permissions: [],
        username: 'jane.doe',
        firstName: 'Jane',
        lastName: 'Doe',
        roles: ['Manager'],
      },
      selectedTenant: {
        id: 'tenant-1',
        name: 'acme',
        displayName: 'Acme Corp',
      },
    });

    useAuthStoreSpy = jest
      .spyOn(authStoreModule, 'useAuthStore')
      .mockReturnValue(mockAuthState);
  });

  afterEach(() => {
    useAuthStoreSpy.mockRestore();
  });

  test('renders user full name and role when available', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Manager, Acme Corp')).toBeTruthy();
  });

  test('falls back to first name when last name missing', () => {
    mockAuthState.user = {
      ...mockAuthState.user!,
      username: 'jane.doe',
      firstName: 'Jane',
      lastName: undefined,
      roles: [],
    };

    render(<ProfileScreen />);

    expect(screen.getByText('Jane')).toBeTruthy();
    expect(screen.getByText('Acme Corp')).toBeTruthy();
  });


  test('renders settings items including theme toggle', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Notification Preferences')).toBeTruthy();
    expect(screen.getByText('Dark Mode')).toBeTruthy();
    expect(screen.getByText('Account Settings')).toBeTruthy();
    expect(screen.getByText('Dark Mode')).toBeTruthy();
  });

  test('invokes notification handler on press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<ProfileScreen />);

    const button = findPressableParent(
      screen.getByText('Notification Preferences')
    );
    fireEvent.press(button);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to notification settings'
    );
    consoleSpy.mockRestore();
  });

  test('invokes account settings handler on press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<ProfileScreen />);

    const button = findPressableParent(screen.getByText('Account Settings'));
    fireEvent.press(button);

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to account settings');
    consoleSpy.mockRestore();
  });
});
