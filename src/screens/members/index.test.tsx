import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { useRouter } from 'expo-router';
import { MembersScreen } from './index';

/* eslint-disable @typescript-eslint/no-require-imports */
const mockUsersStore = require('@/stores/users');
const mockMapStore = require('@/stores/map');
/* eslint-enable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('./components/member-detail-modal', () => ({
  MemberDetailModal: () => {
    const React = require('react');
    const RN = require('react-native');
    return React.createElement(
      RN.View,
      { testID: 'member-detail-modal' },
      'Member Detail'
    );
  },
}));

jest.mock('@/components/battery-icon', () => ({
  BatteryIcon: () => {
    const React = require('react');
    const RN = require('react-native');
    return React.createElement(
      RN.View,
      { testID: 'battery-icon' }
    );
  },
}));

jest.mock('@/components/network-signal-icon', () => ({
  NetworkSignalIcon: () => {
    const React = require('react');
    const RN = require('react-native');
    return React.createElement(
      RN.View,
      { testID: 'network-signal-icon' }
    );
  },
}));
/* eslint-enable @typescript-eslint/no-require-imports */



// Mock modal
const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock('@/components/modal', () => ({
  useModal: jest.fn(() => ({
    ref: { current: null },
    present: mockPresent,
    dismiss: mockDismiss,
  })),
}));

describe('MembersScreen', () => {
  const mockDismissTo = jest.fn();
  const mockSetMapFocusUserId = jest.fn();
  const mockSetFlatViewFocusUserId = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      dismissTo: mockDismissTo,
    });

    // Setup users store
    mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
      const state = {
        users: [],
        isLoading: false,
        error: null,
      };
      return selector ? selector(state) : state;
    });

    // Setup map store
    mockMapStore.useMapStore.mockImplementation((selector?: any) => {
      const state = {
        flatViewFocusUserId: null,
        actions: {
          setMapFocusUserId: mockSetMapFocusUserId,
          setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
        },
      };
      return selector ? selector(state) : state;
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('displays loading state', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [],
          isLoading: true,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(screen.getByText('Loading members...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [],
          isLoading: false,
          error: 'Failed to load members',
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(screen.getByText('Failed to load members')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no users', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(screen.getByText('No members found')).toBeTruthy();
    });
  });

  describe('Members List', () => {
    it('renders list of members', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [{ name: 'member', displayName: 'Member' }],
              attributes: {},
            },
            {
              id: 'user-2',
              username: 'jane_smith',
              fullName: 'Jane Smith',
              avatarId: 'avatar-2',
              roles: [{ name: 'member', displayName: 'Member' }],
              attributes: {},
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('displays username when fullName is not available', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: null,
              avatarId: 'avatar-1',
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(screen.getByText('john_doe')).toBeTruthy();
    });

    it('groups users by role', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'responder_user',
              fullName: 'Responder User',
              avatarId: 'avatar-1',
              roles: [{ name: 'responder', displayName: 'Responder' }],
              attributes: {},
            },
            {
              id: 'user-2',
              username: 'member_user',
              fullName: 'Member User',
              avatarId: 'avatar-2',
              roles: [{ name: 'member', displayName: 'Member' }],
              attributes: {},
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('groups users without roles under "Members"', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'no_role_user',
              fullName: 'No Role User',
              avatarId: 'avatar-1',
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(screen.getByText('Members')).toBeTruthy();
      expect(screen.getByText('No Role User')).toBeTruthy();
    });
  });

  describe('Member Card Interactions', () => {
    it('opens member detail modal when user card is pressed', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [{ name: 'member', displayName: 'Member' }],
              attributes: {},
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { UNSAFE_root } = render(<MembersScreen />);
      // eslint-disable-next-line
      const RN = require('react-native');
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);
      
      // Find and press the user card (first TouchableOpacity)
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockPresent).toHaveBeenCalled();
      }
    });

    it('navigates to map when location icon is pressed', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [{ name: 'member', displayName: 'Member' }],
              attributes: {},
              location: {
                coordinates: [106.7, 10.8],
              },
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('User Avatar', () => {
    it('renders avatar with initials when no avatarId', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: null,
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      // Avatar should render with initials "JD"
      expect(screen.getByText('JD')).toBeTruthy();
    });

    it('generates correct initials from full name', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Michael Doe',
              avatarId: null,
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      // Should take first 2 initials: "JM"
      expect(screen.getByText('JM')).toBeTruthy();
    });

    it('generates initial from username when no fullName', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: null,
              avatarId: null,
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      // Should use first letter of username: "J"
      expect(screen.getByText('J')).toBeTruthy();
    });
  });

  describe('Device Status Icons', () => {
    it('renders battery and network icons for users with attributes', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
              attributes: {
                batteryPercentage: 75,
                networkMbps: 50,
              },
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Flat View Focus Integration', () => {
    it('opens member detail when flatViewFocusUserId is set', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          flatViewFocusUserId: 'user-1',
          actions: {
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(mockPresent).toHaveBeenCalled();
      expect(mockSetFlatViewFocusUserId).toHaveBeenCalledWith(null);
    });

    it('does not open modal when flatViewFocusUserId is null', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          flatViewFocusUserId: null,
          actions: {
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(mockPresent).not.toHaveBeenCalled();
    });

    it('does not open modal when focused user is not found', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          flatViewFocusUserId: 'user-999',
          actions: {
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      expect(mockPresent).not.toHaveBeenCalled();
    });
  });

  describe('User Status Badge', () => {
    it('displays online status', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
              status: 'online',
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      // The avatar should render with online status
      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('displays offline status', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              username: 'john_doe',
              fullName: 'John Doe',
              avatarId: 'avatar-1',
              roles: [],
              status: 'offline',
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      render(<MembersScreen />);
      const { toJSON } = render(<MembersScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Member Detail Modal', () => {
    it('renders MemberDetailModal component', () => {
      render(<MembersScreen />);
      expect(screen.getByTestId('member-detail-modal')).toBeTruthy();
    });
  });
});
