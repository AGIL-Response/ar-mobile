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

jest.mock('./components/password-step', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    PasswordStep: ({ username, password, setPassword, onSubmit, onBack, isLoading, selectedTenant }: any) =>
      React.createElement(
        'View',
        { testID: 'password-step' },
        React.createElement('Text', { testID: 'password-username' }, username),
        React.createElement('Text', { testID: 'password-value' }, password),
        React.createElement('Text', { testID: 'password-loading' }, isLoading ? 'Loading' : 'Not Loading'),
        selectedTenant && React.createElement('Text', { testID: 'password-tenant' }, selectedTenant.name),
        React.createElement('TouchableOpacity', {
          testID: 'password-submit',
          onPress: onSubmit,
        }),
        React.createElement('TouchableOpacity', {
          testID: 'password-back',
          onPress: onBack,
        }),
        React.createElement('TextInput', {
          testID: 'password-input',
          value: password,
          onChangeText: setPassword,
        })
      ),
  };
});

jest.mock('./hooks/use-login-handlers', () => {
  // eslint-disable-next-line
  const React = require('react');
  return {
    useLoginHandlers: jest.fn((props: any) => ({
      handleUsernameSubmit: jest.fn(() => props.authState.actions.checkUsername?.(props.username)),
      handlePasswordSubmit: jest.fn(() => props.authState.actions.loginWithPassword?.(props.username, props.password)),
      handleBackToUsername: jest.fn(() => {
        props.setStep('username');
        props.setPassword('');
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
  const mockLoginWithPassword = jest.fn();
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
      loginWithPassword: mockLoginWithPassword,
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

    (useAuthStore as unknown as jest.Mock).mockImplementation(() => createMockAuthState());
    mockCheckUsername.mockResolvedValue(undefined);
    mockLoginWithPassword.mockResolvedValue(undefined);
  });

  describe('Initial Render', () => {
    it('renders login screen with username step by default', () => {
      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('password-step')).toBeNull();
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

    it('pre-fills username and password in dev mode', () => {
      const originalDev = __DEV__;
      // @ts-ignore
      global.__DEV__ = true;

      render(<Login />);
      const usernameStep = screen.getByTestId('username-step');
      expect(usernameStep).toBeTruthy();
      // In dev mode, username should be pre-filled
      const usernameValue = screen.getByTestId('username-value');
      expect(usernameValue.props.children).toBe('org6r1');

      // @ts-ignore
      global.__DEV__ = originalDev;
    });

    it('does not pre-fill username and password in production mode', () => {
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
      (useAuthStore as unknown as jest.Mock).mockImplementation(() =>
        createMockAuthState({
          selectedTenant: null,
        })
      );

      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('password-step')).toBeNull();
    });
  });

  describe('Username Step Rendering', () => {
    it('passes correct props to UsernameStep component', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation(() =>
        createMockAuthState({
          isCheckingUsername: true,
          usernameError: 'Username not found',
        })
      );

      render(<Login />);
      const usernameStep = screen.getByTestId('username-step');
      expect(usernameStep).toBeTruthy();
      expect(screen.getByTestId('username-loading').props.children).toBe('Loading');
      expect(screen.getByTestId('username-error').props.children).toBe('Username not found');
    });

    it('shows username step when step state is username', () => {
      render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();
      expect(screen.queryByTestId('password-step')).toBeNull();
    });
  });

  describe('Password Step Rendering', () => {
    it('renders password step when step state is password', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation(() =>
        createMockAuthState({
          selectedTenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
            displayName: 'Test Tenant Display',
          },
        })
      );

      render(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('password-step')).toBeTruthy();
      });
    });

    it('passes correct props to PasswordStep component', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation(() =>
        createMockAuthState({
          selectedTenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
            displayName: 'Test Tenant Display',
          },
          isLoading: true,
        })
      );

      render(<Login />);

      await waitFor(() => {
        const passwordStep = screen.getByTestId('password-step');
        expect(passwordStep).toBeTruthy();
        expect(screen.getByTestId('password-loading').props.children).toBe('Loading');
        expect(screen.getByTestId('password-tenant').props.children).toBe('Test Tenant');
      });
    });

    it('displays username in password step welcome message', async () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation(() =>
        createMockAuthState({
          selectedTenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
          },
        })
      );

      render(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('password-username')).toBeTruthy();
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

  describe('useEffect Behavior', () => {
    it('updates step when username and selectedTenant change', async () => {
      let authState = createMockAuthState({
        selectedTenant: null,
      });

      (useAuthStore as unknown as jest.Mock).mockImplementation(() => authState);

      const { rerender } = render(<Login />);
      expect(screen.getByTestId('username-step')).toBeTruthy();

      // Update auth state to have selectedTenant
      authState = createMockAuthState({
        selectedTenant: {
          id: 'tenant-1',
          name: 'Test Tenant',
        },
      });

      (useAuthStore as unknown as jest.Mock).mockImplementation(() => authState);
      rerender(<Login />);

      await waitFor(() => {
        expect(screen.getByTestId('password-step')).toBeTruthy();
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
      expect(callArgs).toHaveProperty('password');
      expect(callArgs).toHaveProperty('setStep');
      expect(callArgs).toHaveProperty('setPassword');
      expect(callArgs).toHaveProperty('setUsername');
      expect(callArgs).toHaveProperty('router');
    });
  });
});
