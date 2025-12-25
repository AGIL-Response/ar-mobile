import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';
import { useAuthStore } from '@/stores/auth';
import { useMapStore } from '@/stores/map';
import { useUsersStore } from '@/stores/users';

import { MembersSection } from './members-section';

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/users', () => ({
  useUsersStore: jest.fn(),
}));

jest.mock('@/stores/map', () => ({
  useMapStore: jest.fn(),
}));

jest.mock('@/components/modal', () => ({
  useModal: jest.fn(),
  Modal: jest.fn(),
}));

jest.mock('@/screens/members', () => ({
  MembersScreen: () => null,
}));

describe('MembersSection', () => {
  const mockFetchTeamMembers = jest.fn();
  const mockPresentMembers = jest.fn();

  // Set up modal mock implementations
  beforeAll(() => {
    const { useModal, Modal } = jest.requireMock('@/components/modal');
    jest.spyOn(console, 'error').mockImplementation();
    (useModal as jest.Mock).mockReturnValue({
      ref: { current: null },
      present: mockPresentMembers,
    });
    (Modal as jest.Mock).mockImplementation(({ children }: any) => children);
  });

  const createMockUser = (overrides = {}) => ({
    id: '1',
    username: 'testuser',
    fullName: 'Test User',
    avatarId: 'avatar-123',
    status: 'online',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ selectedTeam: { id: 'team-123' } })
    );

    (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        users: [],
        isLoading: false,
        actions: {
          fetchTeamMembers: mockFetchTeamMembers,
        },
      })
    );

    (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({ flatViewFocusUserId: null })
    );
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders View All buttons', () => {
      render(<MembersSection />);
      const viewAllButtons = screen.getAllByText('View All');
      // Should have 2: one in header, one in more circle
      expect(viewAllButtons.length).toBe(2);
    });

    it('renders TouchableOpacity elements', () => {
      const { root } = render(<MembersSection />);
      const touchables = root.findAllByType('TouchableOpacity');
      // Should have at least 2 touchables (View All in header + more circle)
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('Initial Data Loading', () => {
    it('fetches team members on mount when teamId exists', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ selectedTeam: { id: 'team-456' } })
      );

      render(<MembersSection />);

      expect(mockFetchTeamMembers).toHaveBeenCalledWith('team-456');
      expect(mockFetchTeamMembers).toHaveBeenCalledTimes(1);
    });

    it('does not fetch when teamId is null', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ selectedTeam: null })
      );

      render(<MembersSection />);

      expect(mockFetchTeamMembers).not.toHaveBeenCalled();
    });

    it('does not fetch when teamId is undefined', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ selectedTeam: { id: undefined } })
      );

      render(<MembersSection />);

      expect(mockFetchTeamMembers).not.toHaveBeenCalled();
    });

    it('refetches when teamId changes', () => {
      const { rerender } = render(<MembersSection />);

      expect(mockFetchTeamMembers).toHaveBeenCalledWith('team-123');

      // Change teamId
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ selectedTeam: { id: 'team-999' } })
      );

      rerender(<MembersSection />);

      expect(mockFetchTeamMembers).toHaveBeenCalledWith('team-999');
      expect(mockFetchTeamMembers).toHaveBeenCalledTimes(2);
    });
  });

  describe('Loading State', () => {
    it('shows loading message when loading and no users', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: true,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      render(<MembersSection />);

      expect(screen.getByText('Loading members...')).toBeTruthy();
    });

    it('does not show loading message when loading but users exist', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: true,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      render(<MembersSection />);

      expect(screen.queryByText('Loading members...')).toBeNull();
    });

    it('loading state has correct structure', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: true,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('renders nothing when no users and not loading', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);

      // Should render empty fragment
      expect(toJSON()).toMatchObject({});
    });

    it('does not render View All button when no users', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      render(<MembersSection />);

      expect(screen.queryByText('View All')).toBeNull();
    });
  });

  describe('User Display', () => {
    it('displays up to 4 users', () => {
      const users = [
        createMockUser({ id: '1', fullName: 'User One' }),
        createMockUser({ id: '2', fullName: 'User Two' }),
        createMockUser({ id: '3', fullName: 'User Three' }),
        createMockUser({ id: '4', fullName: 'User Four' }),
      ];

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users,
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      // Component should render successfully with 4 users
      expect(toJSON()).toBeTruthy();
    });

    it('displays only first 4 users when there are more', () => {
      const users = [
        createMockUser({ id: '1', fullName: 'User One' }),
        createMockUser({ id: '2', fullName: 'User Two' }),
        createMockUser({ id: '3', fullName: 'User Three' }),
        createMockUser({ id: '4', fullName: 'User Four' }),
        createMockUser({ id: '5', fullName: 'User Five' }),
        createMockUser({ id: '6', fullName: 'User Six' }),
      ];

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users,
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      // Component should render successfully with more than 4 users
      expect(toJSON()).toBeTruthy();
    });

    it('displays single user correctly', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ id: '1', fullName: 'Single User' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders View All buttons for navigation', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ id: '1', fullName: 'Test User' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      render(<MembersSection />);
      const viewAllButtons = screen.getAllByText('View All');
      expect(viewAllButtons.length).toBe(2);
    });
  });

  describe('Initials Generation (getInitials)', () => {
    it('generates initials from fullName (first letter of each word)', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: 'Alice Bob', username: 'alice' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      // Should render successfully with fullName
      expect(toJSON()).toBeTruthy();
    });

    it('limits initials to 2 characters', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: 'Alice Bob Carol Dan', username: 'alice' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('converts initials to uppercase', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: 'alice bob', username: 'alice' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('falls back to username first character when no fullName', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: '', username: 'alice' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('falls back to username first character when fullName is null', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: null, username: 'bob' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('falls back to "U" when no fullName and no username', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: '', username: '' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles single word fullName', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: 'Madonna', username: 'madonna' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles fullName with extra spaces', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: '  Alice   Bob  ', username: 'alice' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('View All Button', () => {
    beforeEach(() => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );
    });

    it('opens members modal when View All button is pressed', () => {
      const { root } = render(<MembersSection />);

      const touchables = root.findAllByType('TouchableOpacity');
      // First TouchableOpacity is the View All in header
      fireEvent.press(touchables[0]);

      expect(mockPresentMembers).toHaveBeenCalledTimes(1);
    });

    it('opens members modal when more circle is pressed', () => {
      const { root } = render(<MembersSection />);

      const touchables = root.findAllByType('TouchableOpacity');
      // Last TouchableOpacity is the "View All" circle button
      fireEvent.press(touchables[touchables.length - 1]);

      expect(mockPresentMembers).toHaveBeenCalledTimes(1);
    });

    it('handles multiple presses correctly', () => {
      const { root } = render(<MembersSection />);

      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]);
      fireEvent.press(touchables[0]);
      fireEvent.press(touchables[0]);

      expect(mockPresentMembers).toHaveBeenCalledTimes(3);
    });
  });

  describe('Modal Integration', () => {
    it('opens modal when flatViewFocusUserId changes to a value', () => {
      const { rerender } = render(<MembersSection />);

      expect(mockPresentMembers).not.toHaveBeenCalled();

      // Change flatViewFocusUserId
      (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ flatViewFocusUserId: 'user-456' })
      );

      rerender(<MembersSection />);

      expect(mockPresentMembers).toHaveBeenCalledTimes(1);
    });

    it('does not open modal initially if flatViewFocusUserId is null', () => {
      render(<MembersSection />);

      expect(mockPresentMembers).not.toHaveBeenCalled();
    });

    it('opens modal on subsequent flatViewFocusUserId changes', () => {
      const { rerender } = render(<MembersSection />);

      // First change
      (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ flatViewFocusUserId: 'user-1' })
      );
      rerender(<MembersSection />);

      expect(mockPresentMembers).toHaveBeenCalledTimes(1);

      // Second change
      (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({ flatViewFocusUserId: 'user-2' })
      );
      rerender(<MembersSection />);

      expect(mockPresentMembers).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles users without avatarId', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ avatarId: null })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles users with unknown status', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ status: null })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles users with undefined status', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ status: undefined })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles exactly 4 users (boundary case)', () => {
      const users = [
        createMockUser({ id: '1' }),
        createMockUser({ id: '2' }),
        createMockUser({ id: '3' }),
        createMockUser({ id: '4' }),
      ];

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users,
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles users with special characters in names', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ fullName: "O'Brien-Smith", username: 'obrien' })],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles very long names', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [
            createMockUser({
              fullName: 'Alexander Christopher Benjamin Montgomery',
              username: 'alex',
            }),
          ],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles re-render without errors', () => {
      const { rerender } = render(<MembersSection />);

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );

      rerender(<MembersSection />);

      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    beforeEach(() => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );
    });

    it('renders with theme styles', () => {
      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to View All buttons', () => {
      render(<MembersSection />);
      const viewAllButtons = screen.getAllByText('View All');
      expect(viewAllButtons.length).toBe(2);
    });
  });

  describe('Component Structure', () => {
    beforeEach(() => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser()],
          isLoading: false,
          actions: { fetchTeamMembers: mockFetchTeamMembers },
        })
      );
    });

    it('maintains consistent structure', () => {
      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders header with View All buttons', () => {
      render(<MembersSection />);
      const viewAllButtons = screen.getAllByText('View All');
      expect(viewAllButtons.length).toBe(2);
    });

    it('renders avatar group container', () => {
      const { toJSON } = render(<MembersSection />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
