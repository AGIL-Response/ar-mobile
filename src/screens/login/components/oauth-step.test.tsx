/* eslint-disable import/first */

import React from 'react';
import { render } from '@testing-library/react-native';

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

import { OAuthStep } from './oauth-step';

describe('OAuthStep', () => {
  const baseProps = {
    username: 'testuser',
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    isLoading: false,
    isReady: true,
    isProcessing: false,
    selectedTenant: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

    const { getByText } = render(
      <OAuthStep
        {...baseProps}
        selectedTenant={tenant}
      />
    );

    expect(getByText('Organization:')).toBeTruthy();
    expect(getByText('Tenant Display')).toBeTruthy();
  });

  it('falls back to tenant name when displayName is missing', () => {
    const tenant = {
      id: 't1',
      name: 'tenant-name',
      displayName: '',
    } as any;

    const { getByText } = render(
      <OAuthStep
        {...baseProps}
        selectedTenant={tenant}
      />
    );

    expect(getByText('tenant-name')).toBeTruthy();
  });

  it('shows processing indicator and hides buttons when isProcessing is true', () => {
    const { getByText, queryByTestId } = render(
      <OAuthStep
        {...baseProps}
        isProcessing={true}
      />
    );

    // Shows processing message
    expect(getByText('Processing authentication...')).toBeTruthy();

    // Hides main and back buttons
    expect(queryByTestId('button-Continue to Sign In')).toBeNull();
    expect(queryByTestId('button-Back')).toBeNull();
  });

  it('renders primary and back buttons when not processing', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    expect(getByTestId('button-text-Continue to Sign In')).toBeTruthy();
    expect(getByTestId('button-text-Back')).toBeTruthy();
  });

  it('disables primary button when loading', () => {
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        isLoading={true}
      />
    );

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
  });

  it('disables primary button when not ready', () => {
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        isReady={false}
      />
    );

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
  });

  it('enables primary button when ready and not loading', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(false);
  });

  it('disables back button when loading', () => {
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        isLoading={true}
      />
    );

    const backButton = getByTestId('button-Back');
    expect(backButton.props['data-disabled']).toBe(true);
  });

  it('enables back button when not loading and not processing', () => {
    const { getByTestId } = render(<OAuthStep {...baseProps} />);

    const backButton = getByTestId('button-Back');
    expect(backButton.props['data-disabled']).toBe(false);
  });

  it('calls onSubmit when primary button is pressed', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        onSubmit={onSubmit}
      />
    );

    const button = getByTestId('button-Continue to Sign In');
    // Simulate press by calling onPress prop directly
    button.props.onPress?.();

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        onBack={onBack}
      />
    );

    const backButton = getByTestId('button-Back');
    backButton.props.onPress?.();

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when primary button is disabled', () => {
    const onSubmit = jest.fn();
    const { getByTestId } = render(
      <OAuthStep
        {...baseProps}
        onSubmit={onSubmit}
        isLoading={true}
      />
    );

    const button = getByTestId('button-Continue to Sign In');
    expect(button.props['data-disabled']).toBe(true);
    button.props.onPress?.();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

