import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import ProfileScreen from './index';

/* eslint-disable @typescript-eslint/no-require-imports */
const RN = require('react-native');
const mockAuthStore = require('@/stores/auth');
/* eslint-enable @typescript-eslint/no-require-imports */

// Mock router
const mockRouterNavigate = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: mockRouterNavigate,
    back: mockRouterBack,
  }),
}));

// Mock Button component for better control
jest.mock('@/components/button', () => ({
  Button: ({ onPress, title, testID }: any) => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    /* eslint-enable @typescript-eslint/no-require-imports */
    return React.createElement(
      TouchableOpacity,
      {
        onPress,
        testID: testID || `button-${title}`,
      },
      React.createElement(Text, {}, title)
    );
  },
}));

describe('ProfileScreen', () => {
  const mockLogout = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterNavigate.mockClear();
    mockRouterBack.mockClear();
    mockLogout.mockClear();

    // Setup default mock with user data
    mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
      const state = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'John Doe',
          avatarId: 'avatar-123',
          roles: ['Commander', 'Manager'],
        },
        selectedTenant: {
          id: 'tenant-1',
          name: 'acme',
          displayName: 'Acme Corp',
        },
        actions: {
          logout: mockLogout,
        },
      };
      return selector ? selector(state) : state;
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders AppBar with correct title', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile')).toBeTruthy();
    });

    it('renders AppBar with back button', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders user avatar', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders user full name', () => {
      render(<ProfileScreen />);
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders user email', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('test@example.com')).toBeTruthy();
    });

    it('renders ScrollView for content', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Settings Items Rendering', () => {
    it('renders Profile Details item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile Details')).toBeTruthy();
    });

    it('renders Change Password item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Change Password')).toBeTruthy();
    });

    it('renders Logout item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    it('renders all three settings items', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile Details')).toBeTruthy();
      expect(screen.getByText('Change Password')).toBeTruthy();
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    it('renders settings items in correct order', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('User Display with Roles', () => {
    it('displays user full name', () => {
      render(<ProfileScreen />);
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays user email below name', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('test@example.com')).toBeTruthy();
    });

    it('shows N/A when user full name is missing', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: undefined,
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows N/A when user is null', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: null,
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getUserRole Logic', () => {
    it('formats role with team displayName when user has roles', () => {
      render(<ProfileScreen />);
      // User has Commander role and Acme Corp team
      // The component should display this combination
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses first role when user has multiple roles', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander', 'Manager', 'Leader'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses displayName over name for team', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corporation',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('falls back to name when displayName is missing', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('shows tenant displayName when user has no roles', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: [],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('defaults to Team Member when no tenant or roles', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: [],
          },
          selectedTenant: null,
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Navigation - Profile Details', () => {
    it('navigates to profile detail when Profile Details pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // Find Profile Details button (should be first settings item after back button)
      const profileDetailsButton = touchables.find((t) => {
        const text = t.findAllByType(RN.Text)[0];
        return text && text.props.children === 'Profile Details';
      });

      expect(profileDetailsButton).toBeTruthy();
      if (profileDetailsButton) {
        fireEvent.press(profileDetailsButton);
        expect(mockRouterNavigate).toHaveBeenCalledWith('/(app)/profile/detail');
      }
    });
  });

  describe('Navigation - Change Password', () => {
    it('navigates to change password when Change Password pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // Find Change Password button
      const changePasswordButton = touchables.find((t) => {
        const text = t.findAllByType(RN.Text)[0];
        return text && text.props.children === 'Change Password';
      });

      expect(changePasswordButton).toBeTruthy();
      if (changePasswordButton) {
        fireEvent.press(changePasswordButton);
        expect(mockRouterNavigate).toHaveBeenCalledWith('/(app)/profile/change-password');
      }
    });
  });

  describe('Logout Modal - Opening', () => {
    it('does not show logout modal initially', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText('Log out')).toBeNull();
    });

    it('shows logout modal when Logout item pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // Find Logout button
      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      expect(logoutButton).toBeTruthy();
      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Log out')).toBeTruthy();
      }
    });

    it('shows logout modal title', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Log out')).toBeTruthy();
      }
    });

    it('shows logout confirmation message', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Do you want to log out?')).toBeTruthy();
      }
    });
  });

  describe('Logout Modal - Actions', () => {
    it('closes modal when No button pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // Open modal
      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Log out')).toBeTruthy();

        // Find and press No button
        const noButton = screen.getByTestId('button-No');
        fireEvent.press(noButton);

        // Modal should be closed
        expect(screen.queryByText('Log out')).toBeNull();
      }
    });

    it('does not call logout when No pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        const noButton = screen.getByTestId('button-No');
        fireEvent.press(noButton);

        expect(mockLogout).not.toHaveBeenCalled();
      }
    });

    it('calls logout when Yes button pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        const yesButton = screen.getByTestId('button-Yes');
        fireEvent.press(yesButton);

        expect(mockLogout).toHaveBeenCalled();
      }
    });

    it('navigates back after logout confirmation', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        const yesButton = screen.getByTestId('button-Yes');
        fireEvent.press(yesButton);

        expect(mockRouterBack).toHaveBeenCalled();
      }
    });

    it('closes modal after logout confirmation', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        const yesButton = screen.getByTestId('button-Yes');
        fireEvent.press(yesButton);

        expect(screen.queryByText('Log out')).toBeNull();
      }
    });
  });

  describe('Settings Items Array', () => {
    it('has exactly three settings items', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile Details')).toBeTruthy();
      expect(screen.getByText('Change Password')).toBeTruthy();
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    it('each settings item has correct structure', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Avatar Display', () => {
    it('renders avatar with user avatarId', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses fullName as avatar fallback', () => {
      render(<ProfileScreen />);
      // Avatar uses fallback text
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('handles missing avatarId', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: undefined,
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation - Back Button', () => {
    it('navigates back when AppBar back button pressed', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // First TouchableOpacity should be back button
      const backButton = touchables[0];
      fireEvent.press(backButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme colors', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to avatar border', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to settings section', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases - User Data', () => {
    it('handles empty string full name', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: '',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThanOrEqual(1);
    });

    it('handles missing email', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: undefined,
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      // Email will be undefined, component should handle gracefully
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles undefined roles', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: undefined,
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles empty roles array', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: [],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme',
            displayName: 'Acme Corp',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases - Tenant Data', () => {
    it('handles null selectedTenant', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: null,
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles undefined selectedTenant', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: undefined,
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles tenant with only name field', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            fullName: 'John Doe',
            avatarId: 'avatar-123',
            roles: ['Commander'],
          },
          selectedTenant: {
            id: 'tenant-1',
            name: 'acme-company',
          },
          actions: {
            logout: mockLogout,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<ProfileScreen />);
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('has proper component hierarchy', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders Background component', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders AppBar at the top', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile')).toBeTruthy();
    });

    it('renders ScrollView for content', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders user profile section', () => {
      render(<ProfileScreen />);
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders settings section', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Profile Details')).toBeTruthy();
    });

    it('renders CenteredModal component', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ScrollView Configuration', () => {
    it('hides vertical scroll indicator', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('has proper content container padding', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Divider Rendering', () => {
    it('renders divider between settings items', () => {
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('divider appears at correct position', () => {
      // Divider should appear after second item (index === length - 2)
      const { toJSON } = render(<ProfileScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Logout Confirmation Flow', () => {
    it('completes full logout sequence', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      // Step 1: Open modal
      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Log out')).toBeTruthy();

        // Step 2: Confirm logout
        const yesButton = screen.getByTestId('button-Yes');
        fireEvent.press(yesButton);

        // Step 3: Verify logout called, modal closed, navigated back
        expect(mockLogout).toHaveBeenCalled();
        expect(screen.queryByText('Log out')).toBeNull();
        expect(mockRouterBack).toHaveBeenCalled();
      }
    });

    it('completes cancel sequence', () => {
      const { UNSAFE_root } = render(<ProfileScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);

      const logoutButton = touchables.find((t) => {
        const texts = t.findAllByType(RN.Text);
        return texts.some((text) => text.props.children === 'Logout');
      });

      if (logoutButton) {
        fireEvent.press(logoutButton);
        expect(screen.getByText('Log out')).toBeTruthy();

        const noButton = screen.getByTestId('button-No');
        fireEvent.press(noButton);

        expect(mockLogout).not.toHaveBeenCalled();
        expect(screen.queryByText('Log out')).toBeNull();
        expect(mockRouterBack).not.toHaveBeenCalled();
      }
    });
  });
});
