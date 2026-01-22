import { renderHook, waitFor } from '@testing-library/react-native';

import { useLoginHandlers } from './use-login-handlers';
import { showError } from '@/components/utils';
import type * as AuthSession from 'expo-auth-session';

// Mock dependencies
jest.mock('@/components/utils', () => ({
  showError: jest.fn(),
}));

describe('useLoginHandlers', () => {
  const mockCheckUsername = jest.fn();
  const mockLoginWithOAuth = jest.fn();
  const mockClearUsernameError = jest.fn();
  const mockSetSelectedTenant = jest.fn();
  const mockSetStep = jest.fn();
  const mockSetUsername = jest.fn();
  const mockRouterNavigate = jest.fn();
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  const defaultProps = {
    authState: {
      actions: {
        checkUsername: mockCheckUsername,
        loginWithOAuth: mockLoginWithOAuth,
        clearUsernameError: mockClearUsernameError,
        setSelectedTenant: mockSetSelectedTenant,
      },
    },
    username: 'testuser',
    setStep: mockSetStep,
    setUsername: mockSetUsername,
    router: {
      navigate: mockRouterNavigate,
    } as any,
  };

  const mockTokenResponse: AuthSession.TokenResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    idToken: 'mock-id-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    issuedAt: Date.now() / 1000,
    scope: 'openid',
    state: 'mock-state',
  } as unknown as AuthSession.TokenResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckUsername.mockResolvedValue('test-realm');
    mockLoginWithOAuth.mockResolvedValue(undefined);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Hook Initialization', () => {
    it('returns handler functions', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      expect(result.current.handleUsernameSubmit).toBeDefined();
      expect(result.current.handleOAuthSuccess).toBeDefined();
      expect(result.current.handleOAuthError).toBeDefined();
      expect(result.current.handleBackToUsername).toBeDefined();
    });

    it('returns functions on each render', () => {
      const { result, rerender } = renderHook(
        (props: typeof defaultProps) => useLoginHandlers(props),
        { initialProps: defaultProps }
      );

      const firstRender = result.current;
      rerender(defaultProps);
      const secondRender = result.current;

      expect(typeof firstRender.handleUsernameSubmit).toBe('function');
      expect(typeof secondRender.handleUsernameSubmit).toBe('function');
      expect(typeof firstRender.handleOAuthSuccess).toBe('function');
      expect(typeof secondRender.handleOAuthSuccess).toBe('function');
      expect(typeof firstRender.handleOAuthError).toBe('function');
      expect(typeof secondRender.handleOAuthError).toBe('function');
      expect(typeof firstRender.handleBackToUsername).toBe('function');
      expect(typeof secondRender.handleBackToUsername).toBe('function');
    });
  });

  describe('handleUsernameSubmit', () => {
    it('clears username error before checking', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      expect(mockClearUsernameError).toHaveBeenCalled();
    });

    it('calls checkUsername with username', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(mockCheckUsername).toHaveBeenCalledWith('testuser');
      });
    });

    it('sets step to password when username check succeeds', async () => {
      mockCheckUsername.mockResolvedValue('test-realm');

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(mockSetStep).toHaveBeenCalledWith('password');
      });
    });

    it('logs realm when username check succeeds', async () => {
      mockCheckUsername.mockResolvedValue('test-realm');

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Username check completed for realm:',
          'test-realm'
        );
      });
    });

    it('does not log or change step when realm is null', async () => {
      mockCheckUsername.mockResolvedValue(null);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Username check completed'),
          expect.anything()
        );
        expect(mockSetStep).not.toHaveBeenCalled();
      });
    });

    it('handles username check error gracefully', async () => {
      const error = new Error('Network error');
      mockCheckUsername.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Username check error:', error);
      });
    });

    it('does not throw when username check fails', async () => {
      mockCheckUsername.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await expect(result.current.handleUsernameSubmit()).resolves.not.toThrow();
    });
  });

  describe('handleOAuthSuccess', () => {
    it('logs OAuth completion message', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'OAuth flow completed, processing tokens...'
      );
    });

    it('calls loginWithOAuth with token response', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(mockLoginWithOAuth).toHaveBeenCalledWith(mockTokenResponse);
      });
    });

    it('navigates to home on successful OAuth login', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'OAuth login successful, navigating to home...'
        );
        expect(mockRouterNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('shows error message when OAuth login fails with error message', async () => {
      const error = new Error('Invalid token');
      mockLoginWithOAuth.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith('Invalid token');
      });
    });

    it('shows generic error when OAuth login fails without error message', async () => {
      mockLoginWithOAuth.mockRejectedValue({});

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith('Login failed. Please try again.');
      });
    });

    it('logs error when OAuth login fails', async () => {
      const error = new Error('Test error');
      mockLoginWithOAuth.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth login error:', error);
      });
    });

    it('does not navigate when OAuth login fails', async () => {
      mockLoginWithOAuth.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);

      await waitFor(() => {
        expect(showError).toHaveBeenCalled();
      });

      expect(mockRouterNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleOAuthError', () => {
    it('shows error message from error object', () => {
      const error = new Error('Authentication failed');
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleOAuthError(error);

      expect(showError).toHaveBeenCalledWith('Authentication failed');
    });

    it('shows generic error when error has no message', () => {
      const error = new Error();
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleOAuthError(error);

      expect(showError).toHaveBeenCalledWith(
        'Authentication failed. Please try again.'
      );
    });

    it('logs OAuth error', () => {
      const error = new Error('Test error');
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleOAuthError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('OAuth error:', error);
    });
  });

  describe('handleBackToUsername', () => {
    it('sets step to username', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetStep).toHaveBeenCalledWith('username');
    });

    it('clears username', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetUsername).toHaveBeenCalledWith('');
    });

    it('clears username error', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockClearUsernameError).toHaveBeenCalled();
    });

    it('clears selected tenant', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetSelectedTenant).toHaveBeenCalledWith(null);
    });

    it('executes all actions in correct order', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetStep).toHaveBeenCalled();
      expect(mockSetUsername).toHaveBeenCalled();
      expect(mockClearUsernameError).toHaveBeenCalled();
      expect(mockSetSelectedTenant).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple sequential username submissions', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();
      await result.current.handleUsernameSubmit();
      await result.current.handleUsernameSubmit();

      expect(mockCheckUsername).toHaveBeenCalledTimes(3);
    });

    it('handles multiple sequential OAuth success calls', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);
      await result.current.handleOAuthSuccess(mockTokenResponse);

      expect(mockLoginWithOAuth).toHaveBeenCalledTimes(2);
    });

    it('handles back navigation after failed OAuth login', async () => {
      mockLoginWithOAuth.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(mockTokenResponse);
      result.current.handleBackToUsername();

      expect(mockSetStep).toHaveBeenCalledWith('username');
      expect(mockSetUsername).toHaveBeenCalledWith('');
    });

    it('handles empty username', async () => {
      const props = { ...defaultProps, username: '' };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handleUsernameSubmit();

      expect(mockCheckUsername).toHaveBeenCalledWith('');
    });

    it('handles special characters in username', async () => {
      const props = {
        ...defaultProps,
        username: 'user@example.com',
      };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(mockCheckUsername).toHaveBeenCalledWith('user@example.com');
      });
    });

    it('handles token response with missing optional fields', async () => {
      const minimalTokenResponse = {
        accessToken: 'mock-access-token',
        tokenType: 'Bearer',
      } as unknown as AuthSession.TokenResponse;

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleOAuthSuccess(minimalTokenResponse);

      await waitFor(() => {
        expect(mockLoginWithOAuth).toHaveBeenCalledWith(minimalTokenResponse);
      });
    });
  });
});
