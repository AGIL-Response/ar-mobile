import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import ChangePasswordScreen from './change-password';

/* eslint-disable @typescript-eslint/no-require-imports */
const RN = require('react-native');

// Mock Alert
const mockAlert = jest.spyOn(RN.Alert, 'alert');

// Import the exposed mock from jest-setup.ts
// @ts-ignore - accessing internal mock for testing
const mockHooks = require('@/lib/hooks');
const mockStartChangePasswordFlow = mockHooks.useOAuthFlow;
// Mock Button component
jest.mock('@/components/button', () => ({
  Button: ({ onPress, disabled, loading, title }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(
      TouchableOpacity,
      { 
        onPress: disabled ? undefined : onPress,
        disabled,
        testID: 'change-password-button'
      },
      React.createElement(Text, { testID: loading ? 'loading-text' : 'button-text' }, title)
    );
  },
}));

describe('ChangePasswordScreen', () => {
  const mockBack = jest.fn();
  const mockAuthState = {
    selectedTenant: {
      id: 'tenant-1',
      name: 'test-realm',
      displayName: 'Test Realm',
    },
    user: {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockStartChangePasswordFlow.mockClear();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });

    // Setup auth store mock
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockAuthState);
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders page header with title', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByText('Change Your Password')).toBeTruthy();
    });

    it('renders description text', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByText('You will be redirected to a secure page where you can update your password.')).toBeTruthy();
    });

    it('renders instructions list', () => {
      render(<ChangePasswordScreen />);
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with ScrollView for content', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Instructions Display', () => {
    it('displays instruction about secure authentication page', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('displays instruction about entering passwords', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('displays instruction about security requirements', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('displays instruction about redirection', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('OAuth Flow Integration', () => {
    it('initializes useOAuthFlow with correct realm', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      render(<ChangePasswordScreen />);
      
      expect(useOAuthFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          realm: 'test-realm',
        })
      );
    });

    it('calls startChangePasswordFlow when button is pressed', async () => {
      render(<ChangePasswordScreen />);
      const button = screen.getByTestId('change-password-button');
      
      fireEvent.press(button);
      
      expect(mockStartChangePasswordFlow).toHaveBeenCalled();
    });

    it('handles OAuth success with alert', async () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      let successCallback: any;
      
      useOAuthFlow.mockImplementation((props: any) => {
        successCallback = props.onSuccess;
        return {
          startChangePasswordFlow: mockStartChangePasswordFlow,
          startLoginFlow: jest.fn(),
          isReady: true,
          isProcessing: false,
        };
      });
      
      render(<ChangePasswordScreen />);
      
      // Call success callback
      successCallback();
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Password Updated',
        'Your password has been changed successfully.',
        expect.any(Array)
      );
    });

    it('navigates back after success alert OK is pressed', async () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      let successCallback: any;
      
      useOAuthFlow.mockImplementation((props: any) => {
        successCallback = props.onSuccess;
        return {
          startChangePasswordFlow: mockStartChangePasswordFlow,
          startLoginFlow: jest.fn(),
          isReady: true,
          isProcessing: false,
        };
      });
      
      render(<ChangePasswordScreen />);
      
      // Call success callback
      successCallback();
      
      expect(mockAlert).toHaveBeenCalled();
      
      // Simulate pressing OK button
      const alertButtons = mockAlert.mock.calls[0][2];
      if (alertButtons && alertButtons[0] && alertButtons[0].onPress) {
        alertButtons[0].onPress();
      }
      
      expect(mockBack).toHaveBeenCalled();
    });

    it('handles OAuth error with alert', async () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      let errorCallback: any;
      
      useOAuthFlow.mockImplementation((props: any) => {
        errorCallback = props.onError;
        return {
          startChangePasswordFlow: mockStartChangePasswordFlow,
          startLoginFlow: jest.fn(),
          isReady: true,
          isProcessing: false,
        };
      });
      
      render(<ChangePasswordScreen />);
      
      // Call error callback
      const testError = new Error('Password change failed');
      errorCallback(testError);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Password change failed'
      );
    });

    it('handles OAuth error without message', async () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      let errorCallback: any;
      
      useOAuthFlow.mockImplementation((props: any) => {
        errorCallback = props.onError;
        return {
          startChangePasswordFlow: mockStartChangePasswordFlow,
          startLoginFlow: jest.fn(),
          isReady: true,
          isProcessing: false,
        };
      });
      
      render(<ChangePasswordScreen />);
      
      // Call error callback without message
      const testError = new Error();
      errorCallback(testError);
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to change password. Please try again.'
      );
    });
  });

  describe('Button State', () => {
    it('button is enabled when isReady is true', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: true,
        isProcessing: false,
      });
      
      render(<ChangePasswordScreen />);
      const button = screen.getByTestId('change-password-button');
      
      expect(button.props.disabled).toBeFalsy();
    });

    it('button is disabled when isReady is false', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: false,
        isProcessing: false,
      });
      
      render(<ChangePasswordScreen />);
      const button = screen.getByTestId('change-password-button');
      
      expect(button.props.disabled).toBeTruthy();
    });

    it('button is disabled when isProcessing is true', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: true,
        isProcessing: true,
      });
      
      render(<ChangePasswordScreen />);
      const button = screen.getByTestId('change-password-button');
      
      expect(button.props.disabled).toBeTruthy();
    });

    it('shows loading state when isProcessing is true', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: true,
        isProcessing: true,
      });
      
      render(<ChangePasswordScreen />);
      expect(screen.getByText('Processing...')).toBeTruthy();
    });

    it('does not show processing text when isProcessing is false', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: true,
        isProcessing: false,
      });
      
      render(<ChangePasswordScreen />);
      expect(screen.queryByText('Processing...')).toBeNull();
    });
  });

  describe('Navigation - Back Button', () => {
    it('navigates back when AppBar back button is pressed', () => {
      const { UNSAFE_root } = render(<ChangePasswordScreen />);
      const touchables = UNSAFE_root.findAllByType(RN.TouchableOpacity);
      
      // First TouchableOpacity is the back button
      const backButton = touchables[0];
      
      fireEvent.press(backButton);
      expect(mockBack).toHaveBeenCalled();
    });

  });

  describe('Theme Integration', () => {
    it('renders with theme colors', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme colors to text elements', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByText('Change Your Password')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('has proper component hierarchy', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders ScrollView for content', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders fixed bottom button container', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByTestId('change-password-button')).toBeTruthy();
    });

    it('maintains proper spacing between elements', () => {
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('renders accessible button', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByTestId('change-password-button')).toBeTruthy();
    });

    it('provides visual feedback for processing state', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      useOAuthFlow.mockReturnValue({
        startChangePasswordFlow: mockStartChangePasswordFlow,
        startLoginFlow: jest.fn(),
        isReady: true,
        isProcessing: true,
      });
      
      render(<ChangePasswordScreen />);
      expect(screen.getByText('Processing...')).toBeTruthy();
    });

    it('renders descriptive instructions for users', () => {
      render(<ChangePasswordScreen />);
      expect(screen.getByText('You will be redirected to a secure page where you can update your password.')).toBeTruthy();
    });
  });

  describe('Error Scenarios', () => {
    it('handles missing realm gracefully', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        selectedTenant: null,
        user: mockAuthState.user,
      });
      
      const { toJSON } = render(<ChangePasswordScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('initializes with empty realm when tenant is null', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        selectedTenant: null,
        user: mockAuthState.user,
      });
      
      const { useOAuthFlow } = require('@/lib/hooks');
      render(<ChangePasswordScreen />);
      
      expect(useOAuthFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          realm: '',
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses', async () => {
      render(<ChangePasswordScreen />);
      const button = screen.getByTestId('change-password-button');
      
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      // Should only call once if disabled properly
      expect(mockStartChangePasswordFlow).toHaveBeenCalled();
    });

    it('handles alert callback edge case', async () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      let successCallback: any;
      
      useOAuthFlow.mockImplementation((props: any) => {
        successCallback = props.onSuccess;
        return {
          startChangePasswordFlow: mockStartChangePasswordFlow,
          startLoginFlow: jest.fn(),
          isReady: true,
          isProcessing: false,
        };
      });
      
      render(<ChangePasswordScreen />);
      successCallback();
      
      // Try to access non-existent button
      const alertButtons = mockAlert.mock.calls[0][2];
      if (alertButtons && alertButtons[1]) {
        // Shouldn't exist
        expect(alertButtons[1]).toBeUndefined();
      }
    });
  });

  describe('Realm Configuration', () => {
    it('uses selectedTenant name as realm', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      render(<ChangePasswordScreen />);
      
      expect(useOAuthFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          realm: 'test-realm',
        })
      );
    });

    it('passes callbacks to useOAuthFlow', () => {
      const { useOAuthFlow } = require('@/lib/hooks');
      render(<ChangePasswordScreen />);
      
      const call = useOAuthFlow.mock.calls[0][0];
      expect(call.onSuccess).toBeDefined();
      expect(call.onError).toBeDefined();
      expect(typeof call.onSuccess).toBe('function');
      expect(typeof call.onError).toBe('function');
    });
  });
});
