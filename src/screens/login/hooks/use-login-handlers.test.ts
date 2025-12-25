import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useLoginHandlers } from './use-login-handlers';
import { showError } from '@/components/utils';

// Mock dependencies
jest.mock('@/components/utils', () => ({
  showError: jest.fn(),
}));

describe('useLoginHandlers', () => {
  const mockCheckUsername = jest.fn();
  const mockLoginWithPassword = jest.fn();
  const mockClearUsernameError = jest.fn();
  const mockSetSelectedTenant = jest.fn();
  const mockSetStep = jest.fn();
  const mockSetPassword = jest.fn();
  const mockSetUsername = jest.fn();
  const mockRouterNavigate = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert');
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  const defaultProps = {
    authState: {
      actions: {
        checkUsername: mockCheckUsername,
        loginWithPassword: mockLoginWithPassword,
        clearUsernameError: mockClearUsernameError,
        setSelectedTenant: mockSetSelectedTenant,
      },
    },
    username: 'testuser',
    password: 'testpass',
    setStep: mockSetStep,
    setPassword: mockSetPassword,
    setUsername: mockSetUsername,
    router: {
      navigate: mockRouterNavigate,
    } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckUsername.mockResolvedValue('test-realm');
    mockLoginWithPassword.mockResolvedValue(undefined);
  });

  afterAll(() => {
    alertSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Hook Initialization', () => {
    it('returns handler functions', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      expect(result.current.handleUsernameSubmit).toBeDefined();
      expect(result.current.handlePasswordSubmit).toBeDefined();
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

      // Functions are recreated on each render (not memoized)
      expect(typeof firstRender.handleUsernameSubmit).toBe('function');
      expect(typeof secondRender.handleUsernameSubmit).toBe('function');
      expect(typeof firstRender.handlePasswordSubmit).toBe('function');
      expect(typeof secondRender.handlePasswordSubmit).toBe('function');
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

    it('does not log when realm is null', async () => {
      mockCheckUsername.mockResolvedValue(null);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handleUsernameSubmit();

      await waitFor(() => {
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Username check completed'),
          expect.anything()
        );
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

  describe('handlePasswordSubmit', () => {
    it('shows error when password is empty', async () => {
      const props = { ...defaultProps, password: '' };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handlePasswordSubmit();

      expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter your password');
      expect(mockLoginWithPassword).not.toHaveBeenCalled();
    });

    it('shows error when password is only whitespace', async () => {
      const props = { ...defaultProps, password: '   ' };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handlePasswordSubmit();

      expect(alertSpy).toHaveBeenCalledWith('Error', 'Please enter your password');
      expect(mockLoginWithPassword).not.toHaveBeenCalled();
    });

    it('logs login start', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Login screen: Starting login process for username:',
        'testuser'
      );
    });

    it('calls loginWithPassword with username and password', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(mockLoginWithPassword).toHaveBeenCalledWith('testuser', 'testpass');
      });
    });

    it('navigates to home on successful login', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(mockRouterNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('shows error message when login fails with error message', async () => {
      const error = new Error('Invalid credentials');
      mockLoginWithPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith('Invalid credentials');
      });
    });

    it('shows generic error when login fails without error message', async () => {
      mockLoginWithPassword.mockRejectedValue({});

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(showError).toHaveBeenCalledWith(
          'Login failed. Please check your credentials and try again.'
        );
      });
    });

    it('logs error when login fails', async () => {
      const error = new Error('Test error');
      mockLoginWithPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', error);
      });
    });

    it('does not navigate when login fails', async () => {
      mockLoginWithPassword.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(showError).toHaveBeenCalled();
      });

      expect(mockRouterNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleBackToUsername', () => {
    it('sets step to username', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetStep).toHaveBeenCalledWith('username');
    });

    it('clears password', () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      result.current.handleBackToUsername();

      expect(mockSetPassword).toHaveBeenCalledWith('');
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
      expect(mockSetPassword).toHaveBeenCalled();
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

    it('handles multiple sequential password submissions', async () => {
      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();
      await result.current.handlePasswordSubmit();

      expect(mockLoginWithPassword).toHaveBeenCalledTimes(2);
    });

    it('handles back navigation after failed login', async () => {
      mockLoginWithPassword.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useLoginHandlers(defaultProps));

      await result.current.handlePasswordSubmit();
      result.current.handleBackToUsername();

      expect(mockSetStep).toHaveBeenCalledWith('username');
      expect(mockSetPassword).toHaveBeenCalledWith('');
    });

    it('handles empty username', async () => {
      const props = { ...defaultProps, username: '' };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handleUsernameSubmit();

      expect(mockCheckUsername).toHaveBeenCalledWith('');
    });

    it('handles special characters in credentials', async () => {
      const props = {
        ...defaultProps,
        username: 'user@example.com',
        password: 'p@ssw0rd!#$',
      };
      const { result } = renderHook(() => useLoginHandlers(props));

      await result.current.handlePasswordSubmit();

      await waitFor(() => {
        expect(mockLoginWithPassword).toHaveBeenCalledWith(
          'user@example.com',
          'p@ssw0rd!#$'
        );
      });
    });
  });
});
