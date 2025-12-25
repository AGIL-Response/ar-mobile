import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { UsernameStep } from './username-step';

describe('UsernameStep', () => {
  test('disables continue button when username is empty or whitespace', () => {
    const { rerender } = render(
      <UsernameStep
        username=""
        setUsername={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={false}
        error={null}
      />
    );

    const continueButton = findPressableParent(screen.getByText('Continue'));
    expect(continueButton.props.accessibilityState?.disabled).toBe(true);

    rerender(
      <UsernameStep
        username="   "
        setUsername={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={false}
        error={null}
      />
    );

    expect(continueButton.props.accessibilityState?.disabled).toBe(true);

    rerender(
      <UsernameStep
        username="alice"
        setUsername={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={false}
        error={null}
      />
    );

    const enabledButton = findPressableParent(screen.getByText('Continue'));
    expect(enabledButton.props.accessibilityState?.disabled).toBe(false);
  });

  test('invokes setUsername when text changes', () => {
    const setUsername = jest.fn();

    render(
      <UsernameStep
        username=""
        setUsername={setUsername}
        onSubmit={jest.fn()}
        isLoading={false}
        error={null}
      />
    );

    const input = screen.getByPlaceholderText('Enter your username');
    fireEvent.changeText(input, 'newuser');

    expect(setUsername).toHaveBeenCalledWith('newuser');
  });

  test('invokes onSubmit when continue pressed or submitted from keyboard', () => {
    const onSubmit = jest.fn();

    render(
      <UsernameStep
        username="alice"
        setUsername={jest.fn()}
        onSubmit={onSubmit}
        isLoading={false}
        error={null}
      />
    );

    const button = screen.getByText('Continue');
    fireEvent.press(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText('Enter your username');
    fireEvent(input, 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  test('renders error message when provided', () => {
    render(
      <UsernameStep
        username="alice"
        setUsername={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={false}
        error="Invalid username"
      />
    );

    expect(screen.getByText('Invalid username')).toBeTruthy();
  });

  test('shows loading state on button when isLoading is true', () => {
    render(
      <UsernameStep
        username="alice"
        setUsername={jest.fn()}
        onSubmit={jest.fn()}
        isLoading={true}
        error={null}
      />
    );

    const button = findPressableParent(screen.getByText('Continue'));
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
