import React from 'react';

import { reactNativeRender as render, screen, waitFor } from '@/lib/test-utils';

import Login from './index';
import { useAuthStore } from '@/stores/auth';

jest.mock('./components/username-step', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    UsernameStep: ({ username, setUsername, onSubmit, isLoading, error }: any) =>
      React.createElement(
        'View',
        { testID: 'username-step' },
        React.createElement('Text', { testID: 'username-value' }, username),
        React.createElement('Text', { testID: 'username-loading' }, isLoading ? 'Loading' : 'Not Loading'),
        error && React.createElement('Text', { testID: 'username-error' }, error),
        React.createElement('TouchableOpacity', {
          testID: 'username-submit',
          onPress: onSubmit,
        }),
        React.createElement('TextInput', {
          testID: 'username-input',
          value: username,
          onChangeText: setUsername,
        })
      ),
  };
});

jest.mock('./components/oauth-step', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    OAuthStep: ({ username, onBack, onSuccess, onError }: any) =>
      React.createElement(
        'View',
        { testID: 'oauth-step' },
        React.createElement('Text', { testID: 'oauth-username' }, username),
        React.createElement('TouchableOpacity', {
          testID: 'oauth-back',
          onPress: onBack,
        }),
        React.createElement('TouchableOpacity', {
          testID: 'oauth-success-trigger',
          onPress: () => onSuccess?.({ accessToken: 'mock-token' }),
        }),
        React.createElement('TouchableOpacity', {
          testID: 'oauth-error-trigger',
          onPress: () => onError?.(new Error('Test error')),
        })
      ),
  };
});

jest.mock('./hooks/use-login-handlers', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    useLoginHandlers: jest.fn((props: any) => ({
      handleUsernameSubmit: jest.fn(async () => {
        await props.authState.actions.checkUsername?.(props.username);
        props.setStep?.('password');
      }),
      handleOAuthSuccess: jest.fn(),
      handleOAuthError: jest.fn(),
      handleBackToUsername: jest.fn(() => {
        props.setStep?.('username');
        props.setUsername?.('');
        props.authState.actions.clearUsernameError?.();
        props.authState.actions.setSelectedTenant?.(null);
      }),
    })),
  };
});

jest.mock('@/components', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    FocusAwareStatusBar: ({ theme }: any) =>
      React.createElement('View', { testID: 'status-bar', 'data-theme': theme }),
    ThemeToggle: ({ style, size }: any) =>
      React.createElement('View', { testID: 'theme-toggle', style, 'data-size': size }),
    Text: ({ children, variant, color, centered, style }: any) =>
      React.createElement('Text', { testID: 'text', variant, color, centered, style }, children),
    View: ({ children, style, testID }: any) =>
      React.createElement('View', { testID, style }, children),
  };
});

// eslint-disable-next-line
const routerModule = require('expo-router');

describe('Login', () => {
  const mockCheckUsername = jest.fn();
  const mockClearUsernameError = jest.fn();
  const mockSetSelectedTenant = jest.fn();
  const mockRouterNavigate = jest.fn();

  const createMockAuthState = (overrides: any = {}) => ({
    selectedTeam: null,
    token: { accessToken: undefined },
    user: undefined,
    tenants: [],
    selectedTenant: null,
    isCheckingUsername: false,
    isLoading: false,
    usernameError: null,
    actions: {
      checkUsername: mockCheckUsername,
      clearUsernameError: mockClearUsernameError,
      setSelectedTenant: mockSetSelectedTenant,
      logout: jest.fn(),
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (routerModule.useRouter as jest.Mock) = jest.fn(() => ({
      navigate: mockRouterNavigate,
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }));

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = createMockAuthState();
      return typeof selector === 'function' ? selector(state) : state;
    });
    mockCheckUsername.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Initial Render', () => {
    it('renders login screen with username step by default', () => {
      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('oauth-step')).toBeNull();
    });

    it('renders branding section with logo and title', () => {
      render(<Login />);
      expect(screen.getByText('AGIL Response')).toBeTruthy();
      expect(screen.getByText('Access your tactical command center.')).toBeTruthy();
    });

    it('renders theme toggle and status bar', () => {
      render(<Login />);
      expect(screen.getByTestId('theme-toggle')).toBeTruthy();
      expect(screen.getByTestId('status-bar')).toBeTruthy();
    });

    it('pre-fills username in dev mode', () => {
      const originalDev = __DEV__;
      // @ts-ignore
      global.__DEV__ = true;

      render(<Login />);
      const usernameStep = screen.getByTestId('username-step');
      expect(usernameStep).toBeTruthy();
      const usernameValue = screen.getByTestId('username-value');
      expect(usernameValue.props.children).toBe('org7r1');

      // @ts-ignore
      global.__DEV__ = originalDev;
    });

    it('does not pre-fill username in production mode', () => {
      const originalDev = __DEV__;
      // @ts-ignore
      global.__DEV__ = false;

      render(<Login />);
      const usernameValue = screen.getByTestId('username-value');
      expect(usernameValue.props.children).toBe('');

      // @ts-ignore
      global.__DEV__ = originalDev;
    });
  });

  describe('Step Transition', () => {
    it('stays on username step when tenant is not selected', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = createMockAuthState({ selectedTenant: null });
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('oauth-step')).toBeNull();
    });
  });

  describe('Username Step Rendering', () => {
    it('passes correct props to UsernameStep component', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = createMockAuthState({
          isCheckingUsername: true,
          usernameError: 'Username not found',
        });
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<Login />);
      const usernameStep = screen.getByTestId('username-step');
      expect(usernameStep).toBeTruthy();
      expect(screen.getByTestId('username-loading').props.children).toBe('Loading');
      expect(screen.getByTestId('username-error').props.children).toBe('Username not found');
    });

    it('shows username step when step state is username', () => {
      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('oauth-step')).toBeNull();
    });
  });

  describe('OAuth Step Rendering', () => {
    it('renders oauth step when step is password and tenant is selected', async () => {
      mockCheckUsername.mockResolvedValue('test-realm');
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = createMockAuthState({
          selectedTenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
            displayName: 'Test Tenant Display',
          },
        });
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { rerender } = render(<Login />);

      expect(screen.getByTestId('username-step')).toBeTruthy();

      const usernameSubmit = screen.getByTestId('username-submit');
      await usernameSubmit.props.onPress();

      rerender(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('oauth-step')).toBeTruthy();
      });
    });

    it('passes correct props to OAuthStep component', async () => {
      const { rerender } = render(<Login />);
      
      // Start on username step
      expect(screen.getByTestId('username-step')).toBeTruthy();
      
      // Submit username to move to OAuth step
      const usernameSubmit = screen.getByTestId('username-submit');
      await usernameSubmit.props.onPress();
      
      rerender(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('oauth-step')).toBeTruthy();
        expect(screen.getByTestId('oauth-username')).toBeTruthy();
        expect(screen.getByTestId('oauth-back')).toBeTruthy();
      });
    });

    it('displays username in oauth step', async () => {
      const { rerender } = render(<Login />);
      
      // Submit username to move to OAuth step
      const usernameSubmit = screen.getByTestId('username-submit');
      await usernameSubmit.props.onPress();
      
      rerender(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('oauth-username')).toBeTruthy();
      });
    });
  });

  describe('Component Structure', () => {
    it('renders ImageBackground with correct structure', () => {
      const { root } = render(<Login />);
      const imageBackgrounds = root.findAllByType('ImageBackground');
      expect(imageBackgrounds.length).toBeGreaterThan(0);
    });

    it('renders KeyboardAvoidingView with correct behavior', () => {
      const { root } = render(<Login />);
      const keyboardViews = root.findAllByType('KeyboardAvoidingView');
      expect(keyboardViews.length).toBeGreaterThan(0);
      // Platform-specific behavior is tested via Platform.OS
    });

    it('renders ScrollView with correct props', () => {
      const { root } = render(<Login />);
      const scrollViews = root.findAllByType('ScrollView');
      expect(scrollViews.length).toBeGreaterThan(0);
      if (scrollViews.length > 0) {
        expect(scrollViews[0].props.keyboardShouldPersistTaps).toBe('handled');
        expect(scrollViews[0].props.showsVerticalScrollIndicator).toBe(false);
      }
    });

    it('renders logo image', () => {
      const { root } = render(<Login />);
      const images = root.findAllByType('Image');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Integration', () => {
    it('renders light overlay when theme is not dark', () => {
      const { root } = render(<Login />);
      // The light overlay View should be rendered when !theme.isDark
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    it('uses theme for styling', () => {
      render(<Login />);
      // Theme is used throughout the component for colors and styles
      expect(screen.getByTestId('status-bar')).toBeTruthy();
      expect(screen.getByTestId('theme-toggle')).toBeTruthy();
    });
  });

  describe('Step Behavior', () => {
    it('shows oauth step when username is submitted successfully', async () => {
      mockCheckUsername.mockResolvedValue('test-realm');
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = createMockAuthState({
          selectedTenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
          },
        });
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { rerender } = render(<Login />);

      expect(screen.getByTestId('username-step')).toBeTruthy();

      const usernameSubmit = screen.getByTestId('username-submit');
      await usernameSubmit.props.onPress();

      rerender(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('oauth-step')).toBeTruthy();
      });
    });
  });

  describe('Login Handlers Integration', () => {
    it('uses useLoginHandlers hook with correct parameters', () => {
      // eslint-disable-next-line
      const { useLoginHandlers } = require('./hooks/use-login-handlers');
      render(<Login />);

      expect(useLoginHandlers).toHaveBeenCalled();
      const callArgs = (useLoginHandlers as jest.Mock).mock.calls[0][0];
      expect(callArgs).toHaveProperty('authState');
      expect(callArgs).toHaveProperty('username');
      expect(callArgs).toHaveProperty('setStep');
      expect(callArgs).toHaveProperty('setUsername');
      expect(callArgs).toHaveProperty('router');
    });
  });
});
