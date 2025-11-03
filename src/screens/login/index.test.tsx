import React from 'react';
import { Alert } from 'react-native';

import { showError } from '@/components/utils';
import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import Login from './index';
import { AuthState } from '@/stores/auth';

const { __pushMock: pushMock } = require('expo-router');

let showErrorMock: jest.Mock;
jest.spyOn(console, 'error').mockImplementation(() => {});

const checkUsernameMock = jest.fn();
const loginWithPasswordMock = jest.fn();
let mockAuthState: AuthState;
jest.mock('@/stores/auth', () => ({
  __esModule: true,
  default: () => mockAuthState,
  useAuthStore: () => mockAuthState,
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
    showErrorMock = showError as jest.Mock;
    showErrorMock.mockClear();
    checkUsernameMock.mockReset();
    loginWithPasswordMock.mockReset();
    loginWithPasswordMock.mockResolvedValue(undefined);
    mockAuthState = {
      token: { accessToken: undefined },
      tenants: [],
      selectedTenant: null,
      isLoading: false,
      isCheckingUsername: false,
      usernameError: null,
      actions: {
        checkUsername: checkUsernameMock.mockImplementation(async () => {
          return 'realm-1';
        }),
        loginWithPassword: loginWithPasswordMock.mockResolvedValue(undefined),
        clearUsernameError: jest.fn(),
        setSelectedTenant: jest.fn(),
      },
    } as any;
  });

  test('renders username step and calls checkUsername on Continue', async () => {
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');

    fireEvent.changeText(usernameInput, '');

    const continueBtn = findPressableParent(
      await screen.findByText('Continue')
    );
    expect(continueBtn.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(usernameInput, 'testuser');

    await waitFor(() => {
      expect(continueBtn.props.accessibilityState.disabled).toBe(false);
    });

    fireEvent.press(continueBtn);

    await waitFor(() => {
      expect(checkUsernameMock).toHaveBeenCalledWith('testuser');
    });
    expect(mockAuthState.actions.clearUsernameError).toHaveBeenCalled();
  });

  test('renders password step when tenant is selected and logs in successfully', async () => {
    // Pre-set selectedTenant so effect moves to password step
    mockAuthState.selectedTenant = {
      id: 't1',
      name: 'acme',
      displayName: 'Acme',
    };

    render(<Login />);

    // Username field still present but we should see password inputs and Sign In button
    const passwordInput = await screen.findByPlaceholderText(
      'Enter your password'
    );
    const signInBtn = findPressableParent(await screen.findByText('Sign In'));

    fireEvent.changeText(passwordInput, 'secret');
    fireEvent.press(signInBtn);

    const expectedUsername = __DEV__ ? 'org6u1' : '';
    await waitFor(() => {
      expect(loginWithPasswordMock).toHaveBeenCalledWith(
        expectedUsername,
        'secret'
      );
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert when password is empty and prevents login', async () => {
    mockAuthState.selectedTenant = {
      id: 't1',
      name: 'acme',
      displayName: 'Acme',
    };

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<Login />);

    const passwordInput = await screen.findByPlaceholderText(
      'Enter your password'
    );
    fireEvent.changeText(passwordInput, '');

    fireEvent(passwordInput, 'submitEditing');

    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'Please enter your password'
    );
    expect(loginWithPasswordMock).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test('shows error message when login fails', async () => {
    mockAuthState.selectedTenant = {
      id: 't1',
      name: 'acme',
      displayName: 'Acme',
    };

    const error = new Error('Invalid credentials');
    loginWithPasswordMock.mockRejectedValueOnce(error);

    render(<Login />);

    const passwordInput = await screen.findByPlaceholderText(
      'Enter your password'
    );
    const signInBtn = findPressableParent(await screen.findByText('Sign In'));

    fireEvent.changeText(passwordInput, 'secret');
    fireEvent.press(signInBtn);

    await waitFor(() => {
      expect(showErrorMock).toHaveBeenCalledWith('Invalid credentials');
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('returns to username step when back is pressed', async () => {
    mockAuthState.selectedTenant = {
      id: 't1',
      name: 'acme',
      displayName: 'Acme',
    };

    render(<Login />);

    await screen.findByPlaceholderText('Enter your password');

    mockAuthState.actions.clearUsernameError();
    mockAuthState.actions.setSelectedTenant(null);

    fireEvent.press(findPressableParent(screen.getByText('Back')));

    expect(screen.getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(mockAuthState.actions.clearUsernameError).toHaveBeenCalled();
    expect(mockAuthState.actions.setSelectedTenant).toHaveBeenCalledWith(null);
  });
});
