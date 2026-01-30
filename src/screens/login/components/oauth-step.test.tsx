/* eslint-disable import/first */

import React from 'react';
import { render } from '@testing-library/react-native';

const mockStartLoginFlow = jest.fn();

jest.mock('@/lib/hooks/use-oauth-flow', () => ({
  useOAuthFlow: jest.fn(() => ({
    startLoginFlow: mockStartLoginFlow,
    isReady: true,
    isProcessing: false,
  })),
}));

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn((selector: (s: any) => any) => {
    const state = {
      selectedTenant: null as any,
      isLoading: false,
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock Button, Text, View from '@/components' to simplify assertions
jest.mock('@/components', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const MockText = ({ children, ...props }: any) =>
    React.createElement('Text', props, children);

  const MockView = ({ children, ...props }: any) =>
    React.createElement('View', props, children);

  const MockButton = ({ title, onPress, disabled, ...props }: any) =>
    React.createElement(
      'Button',
      {
        onPress: disabled ? undefined : onPress,
        'data-disabled': disabled ?? false,
        'data-title': title,
        testID: `button-${title}`,
        ...props,
      },
      React.createElement('Text', { testID: `button-text-${title}` }, title)
    );

  return {
    __esModule: true,
    Text: MockText,
    View: MockView,
    Button: MockButton,
  };
});

const useAuthStoreMock = jest.requireMock('@/stores/auth').useAuthStore;
const useOAuthFlowMock = jest.requireMock('@/lib/hooks/use-oauth-flow').useOAuthFlow;

import { OAuthStep } from './oauth-step';

describe('OAuthStep', () => {
  const baseProps = {
    username: 'testuser',
    onBack: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: null, isLoading: false };
      return selector ? selector(s) : s;
    });
    useOAuthFlowMock.mockReturnValue({
      startLoginFlow: mockStartLoginFlow,
      isReady: true,
      isProcessing: false,
    });
  });

  it('renders welcome message with username', () => {
    const { getByText } = render(<OAuthStep {...baseProps} />);

    // Outer text contains "Welcome back,"
    expect(getByText(/Welcome back/)).toBeTruthy();
    // Inner username text
    expect(getByText('testuser')).toBeTruthy();
  });

  it('renders selected tenant displayName when provided', () => {
    const tenant = {
      id: 't1',
      name: 'tenant-name',
      displayName: 'Tenant Display',
    } as any;
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: tenant, isLoading: false };
      return selector ? selector(s) : s;
    });

    const { getByText } = render(<OAuthStep {...baseProps} />);

    expect(getByText('Organization:')).toBeTruthy();
    expect(getByText('Tenant Display')).toBeTruthy();
  });

  it('falls back to tenant name when displayName is missing', () => {
    const tenant = {
      id: 't1',
      name: 'tenant-name',
      displayName: '',
    } as any;
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: tenant, isLoading: false };
      return selector ? selector(s) : s;
    });

    const { getByText } = render(<OAuthStep {...baseProps} />);

    expect(getByText('tenant-name')).toBeTruthy();
  });

  it('shows processing indicator and hides buttons when isProcessing is true', () => {
    useOAuthFlowMock.mockReturnValue({
      startLoginFlow: mockStartLoginFlow,
      isReady: true,
      isProcessing: true,
    });

    const { getByText, queryByTestId } = render(<OAuthStep {...baseProps} />);

    expect(getByText('Processing authentication...')).toBeTruthy();
    expect(queryByTestId('button-Continue to Sign In')).toBeNull();
    expect(queryByTestId('button-Back')).toBeNull();
  });

  it('renders primary and back buttons when not processing', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    expect(getByTestId('button-text-Continue to Sign In')).toBeTruthy();
    expect(getByTestId('button-text-Back')).toBeTruthy();
  });

  it('disables primary button when loading', () => {
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: null, isLoading: true };
      return selector ? selector(s) : s;
    });

    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
  });

  it('disables primary button when not ready', () => {
    useOAuthFlowMock.mockReturnValue({
      startLoginFlow: mockStartLoginFlow,
      isReady: false,
      isProcessing: false,
    });

    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
  });

  it('enables primary button when ready and not loading', () => {
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: null, isLoading: false };
      return selector ? selector(s) : s;
    });
    useOAuthFlowMock.mockReturnValue({
      startLoginFlow: mockStartLoginFlow,
      isReady: true,
      isProcessing: false,
    });

    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(false);
  });

  it('disables back button when loading', () => {
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: null, isLoading: true };
      return selector ? selector(s) : s;
    });

    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const backButton = getByTestId('button-Back');
    expect(backButton.props['data-disabled']).toBe(true);
  });

  it('enables back button when not loading and not processing', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const backButton = getByTestId('button-Back');
    expect(backButton.props['data-disabled']).toBe(false);
  });

  it('calls startLoginFlow when primary button is pressed', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    button.props.onPress?.();

    expect(mockStartLoginFlow).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <OAuthStep {...baseProps} onBack={onBack} />
    );

    const backButton = getByTestId('button-Back');
    backButton.props.onPress?.();

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not call startLoginFlow when primary button is disabled', () => {
    useAuthStoreMock.mockImplementation((selector: (s: any) => any) => {
      const s = { selectedTenant: null, isLoading: true };
      return selector ? selector(s) : s;
    });

    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
    button.props.onPress?.();
    expect(mockStartLoginFlow).not.toHaveBeenCalled();
  });
});

