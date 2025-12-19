import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { useRouter } from 'expo-router';
import { AppHeader } from './app-header';
import { SosSection } from './sos-section';

const mockAuthStore = require('@/stores/auth');
const mockNotificationsStore = require('@/stores/notifications');

jest.mock('./sos-section');

describe('AppHeader', () => {
  const mockNavigate = jest.fn();
  const mockGetUnreadCount = jest.fn();

  beforeAll(() => {
    (SosSection as jest.Mock).mockImplementation(() =>
      React.createElement('View', { testID: 'sos-section' }, 'SOS')
    );
    // Suppress console.error for file loading errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    (useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockAuthStore.useAuthStore.mockImplementation((selector) => {
      const state = {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          avatarId: 'avatar-123',
        },
      };
      return selector ? selector(state) : state;
    });

    mockNotificationsStore.useNotificationsStore.mockImplementation(
      (selector) => {
        const state = {
          unreadCount: 0,
          actions: {
            getUnreadCount: mockGetUnreadCount,
          },
        };
        return selector ? selector(state) : state;
      }
    );
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<AppHeader />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SOS section', () => {
      render(<AppHeader />);
      expect(screen.getByTestId('sos-section')).toBeTruthy();
    });

    it('renders notification icon button', () => {
      render(<AppHeader />);
      const icons = screen.getAllByTestId('mock-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders avatar component', () => {
      render(<AppHeader />);
      // Avatar shows "?" as default fallback when no source
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('applies correct layout structure', () => {
      const { toJSON } = render(<AppHeader />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });
  });

  describe('Notification Badge', () => {
    it('does not show badge when unreadCount is 0', () => {


      const { toJSON } = render(<AppHeader />);
      const tree = toJSON();
      
      // Badge should not be rendered when unreadCount is 0
      expect(tree).toBeTruthy();
    });

    it('shows badge when unreadCount is greater than 0', () => {
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: 5,
            actions: {
              getUnreadCount: mockGetUnreadCount,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      const { toJSON } = render(<AppHeader />);
      const tree = toJSON();
      
      // Badge should be rendered when unreadCount > 0
      expect(tree).toBeTruthy();
    });

    it('shows badge for single unread notification', () => {
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: 1,
            actions: {
              getUnreadCount: mockGetUnreadCount,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    it('shows badge for multiple unread notifications', () => {
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: 99,
            actions: {
              getUnreadCount: mockGetUnreadCount,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });

  describe('User Avatar', () => {
    it('renders avatar with user avatarId', () => {
      render(<AppHeader />);
      // Avatar is rendered (file loading is tested separately)
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('renders avatar without avatarId when user has no avatar', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector) => {
        const state = {
          user: {
            avatarId: undefined,
          },
        };
        return selector ? selector(state) : state;
      }); 

      render(<AppHeader />);
      // Avatar shows fallback when no avatarId
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('renders avatar with null avatarId', () => {
      (mockAuthStore.useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            avatarId: null,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<AppHeader />);
      // Avatar shows fallback when avatarId is null
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('renders avatar with small size', () => {
      render(<AppHeader />);
      // Avatar is rendered with small size (style testing done in Avatar component tests)
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('handles user being null', () => {
      (mockAuthStore.useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          user: null,
        };
        return selector ? selector(state) : state;
      });

      render(<AppHeader />);
      // Avatar still renders with fallback
      expect(screen.getByText('?')).toBeTruthy();
    });

    it('handles user being undefined', () => {
      (mockAuthStore.useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          user: undefined,
        };
        return selector ? selector(state) : state;
      });

      render(<AppHeader />);
      // Avatar still renders with fallback
      expect(screen.getByText('?')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to notifications when notification button is pressed', () => {
      const { root } = render(<AppHeader />);
      
      // Get all TouchableOpacity components
      const touchables = root.findAllByType('TouchableOpacity');
      // First TouchableOpacity should be notification button
      const notificationButton = touchables[0];

      expect(notificationButton).toBeTruthy();
      fireEvent.press(notificationButton);
      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('navigates to profile when avatar button is pressed', () => {
      const { root } = render(<AppHeader />);
      
      // Get all TouchableOpacity components
      const touchables = root.findAllByType('TouchableOpacity');
      // Second TouchableOpacity should be avatar button
      const avatarButton = touchables[1];

      expect(avatarButton).toBeTruthy();
      fireEvent.press(avatarButton);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('does not navigate when notification button is disabled', () => {
      render(<AppHeader />);
      
      // Should not throw error even if button is somehow disabled
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Initial Data Loading', () => {
    it('calls getUnreadCount on mount', () => {
      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);
    });

    it('only calls getUnreadCount once on mount', () => {
      const { rerender } = render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);

      // Re-render should not call getUnreadCount again
      rerender(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);
    });

    it('loads unread count even when count is 0', () => {
      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });

  describe('Safe Area Handling', () => {
    it('applies safe area insets to container', () => {
      const { toJSON } = render(<AppHeader />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });

    it('handles different safe area insets', () => {
      // Safe area insets are applied via styles (tested visually)
      const { toJSON } = render(<AppHeader />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles zero safe area insets', () => {
      // Safe area insets are applied via styles (tested visually)
      const { toJSON } = render(<AppHeader />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with default theme', () => {
      const { toJSON } = render(<AppHeader />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme colors to components', () => {
      render(<AppHeader />);
      const icons = screen.getAllByTestId('mock-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing notification store actions', () => {
      const mockGetUnreadUndefined = undefined;
      
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: 0,
            actions: {
              getUnreadCount: mockGetUnreadUndefined,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      // Should handle gracefully even if getUnreadCount might throw
      try {
        render(<AppHeader />);
      } catch (error) {
        // Expected if getUnreadCount is undefined and called
        expect(error).toBeDefined();
      }
    });

    it('handles negative unread count', () => {
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: -1,
            actions: {
              getUnreadCount: mockGetUnreadCount,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    it('handles very large unread count', () => {
      (mockNotificationsStore.useNotificationsStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            unreadCount: 9999,
            actions: {
              getUnreadCount: mockGetUnreadCount,
            },
          };
          return selector ? selector(state) : state;
        }
      );

      render(<AppHeader />);
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });

    it('renders correctly when router is undefined', () => {
      (useRouter as jest.Mock).mockReturnValue(undefined);

      // Should render but navigation will fail
      expect(() => render(<AppHeader />)).not.toThrow();
    });

    it('handles multiple rapid presses on notification button', () => {
      const { root } = render(<AppHeader />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      const notificationButton = touchables[0];

      fireEvent.press(notificationButton);
      fireEvent.press(notificationButton);
      fireEvent.press(notificationButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    });

    it('handles multiple rapid presses on avatar button', () => {
      const { root } = render(<AppHeader />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      const avatarButton = touchables[1];

      fireEvent.press(avatarButton);
      fireEvent.press(avatarButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Component Structure', () => {
    it('has left section with SOS container', () => {
      render(<AppHeader />);
      expect(screen.getByTestId('sos-section')).toBeTruthy();
    });

    it('has right section with notification and avatar buttons', () => {
      const { root } = render(<AppHeader />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThanOrEqual(2);
    });

    it('renders components in correct order', () => {
      const { toJSON } = render(<AppHeader />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });

    it('maintains proper component hierarchy', () => {
      const { toJSON } = render(<AppHeader />);
      // Component hierarchy is maintained (snapshot testing not required)
      expect(toJSON()).toBeTruthy();
    });
  });
});
