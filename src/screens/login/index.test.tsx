import React from 'react';

import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

import Login from './index';

const { __pushMock: pushMock } = require('expo-router');

jest.mock('@/components', () => {
  const React = require('react');
  const { Text: RNText, View: RNView, Pressable } = require('react-native');
  const Text = ({ children, ...rest }: any) => (
    <RNText accessibilityRole="text" {...rest}>
      {children}
    </RNText>
  );
  const View = ({ children, ...rest }: any) => (
    <RNView {...rest}>{children}</RNView>
  );
  const Button = ({ title, onPress, disabled }: any) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      testID={`btn-${title}`}
    >
      <RNText>{title}</RNText>
    </Pressable>
  );
  const ErrorText = ({ children }: any) => (
    <RNText accessibilityRole="text">{children}</RNText>
  );
  const FocusAwareStatusBar = () => null;
  const ThemeToggle = () => null;
  return {
    __esModule: true,
    Text,
    View,
    Button,
    ErrorText,
    FocusAwareStatusBar,
    ThemeToggle,
  };
});

const checkUsernameMock = jest.fn();
const loginWithPasswordMock = jest.fn();
let mockAuthState: any;
jest.mock('@/stores/auth', () => ({
  __esModule: true,
  default: () => mockAuthState,
  useAuthStore: () => mockAuthState,
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
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
    };
  });

  test('renders username step and calls checkUsername on Continue', async () => {
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');

    fireEvent.changeText(usernameInput, '');

    const continueBtn = await screen.findByTestId('btn-Continue');
    expect(continueBtn.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(usernameInput, 'testuser');

    await waitFor(() => {
      expect(continueBtn.props.accessibilityState.disabled).toBe(false);
    });

    fireEvent.press(continueBtn);

    await waitFor(() => {
      expect(checkUsernameMock).toHaveBeenCalledWith('testuser');
    });
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
    const signInBtn = await screen.findByTestId('btn-Sign In');

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
});
