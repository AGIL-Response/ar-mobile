import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { MembersSection } from './members-section';

const authStoreModule = require('@/stores/auth');
const usersStoreModule = require('@/stores/users');
const { __pushMock: pushMock } = require('expo-router');


const fontsModule = require('@/lib/fonts');
if (!fontsModule.FontFamilies) {
  fontsModule.FontFamilies = {
    manropeRegular: 'Manrope_400Regular',
    manropeMedium: 'Manrope_500Medium',
    manropeSemiBold: 'Manrope_600SemiBold',
    manropeBold: 'Manrope_700Bold',
    russoOneRegular: 'RussoOne_400Regular',
    robotoMedium: 'Roboto_500Medium',
    interBold: 'Inter_700Bold',
    sFProText: 'SF Pro Text',
  };
}

describe('MembersSection', () => {
  let mockUsersState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    authStoreModule.useAuthStore.mockImplementation(() => ({
      selectedTenant: { id: 'tenant-42' },
    }));

    mockUsersState = {
      users: [],
      isLoading: false,
      actions: {
        fetchUsers: jest.fn(),
      },
    };

    usersStoreModule.useUsersStore.mockImplementation(() => mockUsersState);
  });

  it('fetches members for the selected tenant on mount', async () => {
    render(<MembersSection />);

    await waitFor(() => {
      expect(mockUsersState.actions.fetchUsers).toHaveBeenCalledWith('tenant-42');
    });
  });

  it('shows a loading message when members are being fetched', () => {
    mockUsersState.isLoading = true;

    render(<MembersSection />);

    expect(screen.getByText('Loading members...')).toBeTruthy();
  });

  it('shows an empty state when no members exist', () => {
    render(<MembersSection />);

    expect(screen.getByText('No members found')).toBeTruthy();
  });

  it('renders member entries and a more badge when there are extra members', () => {
    mockUsersState.users = [
      { id: '1', username: 'alice', fullName: 'Alice Adams', roles: [] },
      { id: '2', username: 'bob', fullName: 'Bob Brown', roles: [] },
      { id: '3', username: 'carol', fullName: 'Carol Clark', roles: [] },
      { id: '4', username: 'dan', fullName: 'Dan Davis', roles: [] },
      { id: '5', username: 'erin', fullName: 'Erin Evans', roles: [] },
    ];

    render(<MembersSection />);

    expect(screen.getByText('+1')).toBeTruthy();
  });

  it('navigates to members list when View All is pressed', () => {
    mockUsersState.users = [
      { id: '1', username: 'alice', fullName: 'Alice Adams', roles: [] },
    ];

    render(<MembersSection />);

    fireEvent.press(findPressableParent(screen.getByText('View All')));

    expect(pushMock).toHaveBeenCalledWith('/members');
  });
});

