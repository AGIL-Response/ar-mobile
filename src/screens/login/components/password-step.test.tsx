import React from 'react';

import { findPressableParent, fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';

import type { ITenant } from '@/stores/auth';
import { PasswordStep } from './password-step';

const tenant: ITenant = {
  id: 'tenant-1',
  name: 'tenant',
  displayName: 'Tenant Display',
};

describe('PasswordStep', () => {
  test('renders welcome message and tenant information', () => {
    render(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={jest.fn()}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isLoading={false}
        selectedTenant={tenant}
      />
    );

    expect(screen.getByText(/Welcome back/i)).toBeTruthy();
    expect(screen.getByText('jane')).toBeTruthy();
    expect(screen.getByText('Organization:')).toBeTruthy();
    expect(screen.getByText('Tenant Display')).toBeTruthy();
  });

  test('hides tenant information when not available', () => {
    render(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={jest.fn()}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isLoading={false}
        selectedTenant={null}
      />
    );

    expect(screen.queryByText('Organization:')).toBeNull();
  });

  test('disables sign in button when loading or password empty', () => {
    const { rerender } = render(
      <PasswordStep
        username="jane"
        password=""
        setPassword={jest.fn()}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isLoading={false}
        selectedTenant={tenant}
      />
    );

    let button = findPressableParent(screen.getByText('Sign In'));
    expect(button.props.accessibilityState?.disabled).toBe(true);

    rerender(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={jest.fn()}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isLoading={true}
        selectedTenant={tenant}
      />
    );

    button = findPressableParent(screen.getByText('Sign In'));
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  test('calls setPassword when input value changes', () => {
    const setPassword = jest.fn();

    render(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={setPassword}
        onSubmit={jest.fn()}
        onBack={jest.fn()}
        isLoading={false}
        selectedTenant={tenant}
      />
    );

    const input = screen.getByPlaceholderText('Enter your password');
    fireEvent.changeText(input, 'newpass');

    expect(setPassword).toHaveBeenCalledWith('newpass');
  });

  test('invokes onSubmit for button press and submit editing', () => {
    const onSubmit = jest.fn();

    render(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={jest.fn()}
        onSubmit={onSubmit}
        onBack={jest.fn()}
        isLoading={false}
        selectedTenant={tenant}
      />
    );

    const button = findPressableParent(screen.getByText('Sign In'));
    fireEvent.press(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText('Enter your password');
    fireEvent(input, 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  test('invokes onBack when back button pressed', () => {
    const onBack = jest.fn();

    render(
      <PasswordStep
        username="jane"
        password="secret"
        setPassword={jest.fn()}
        onSubmit={jest.fn()}
        onBack={onBack}
        isLoading={false}
        selectedTenant={tenant}
      />
    );

    fireEvent.press(findPressableParent(screen.getByText('Back')));

    expect(onBack).toHaveBeenCalled();
  });
});

