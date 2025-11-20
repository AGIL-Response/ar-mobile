import React, { Ref } from 'react';

import { Linking, Platform, Switch, SwitchProps } from 'react-native';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { LocationPermissionScreen } from './location-permission-screen';

jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const React = require('react');
  const MockSwitch = React.forwardRef((props: SwitchProps, ref: Ref<Switch>) =>
    React.createElement('RCTSwitch', { ...props, ref })
  );
  MockSwitch.displayName = 'MockSwitch';

  return {
    __esModule: true,
    default: MockSwitch,
  };
});

describe('LocationPermissionScreen', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
    });
  });

  it('calls onRequestPermission and onCancel handlers', async () => {
    const onRequestPermission = jest.fn().mockResolvedValue(undefined);
    const onCancel = jest.fn();

    render(
      <LocationPermissionScreen
        onRequestPermission={onRequestPermission}
        onCancel={onCancel}
      />
    );

    fireEvent.press(
      findPressableParent(screen.getByText('Allow Location Access'))
    );
    await waitFor(() => {
      expect(onRequestPermission).toHaveBeenCalled();
    });

    fireEvent.press(findPressableParent(screen.getByText('Cancel')));
    expect(onCancel).toHaveBeenCalled();
  });

  it('opens settings on iOS when permission denied error present', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const openURLSpy = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue('app-settings:');

    render(
      <LocationPermissionScreen
        onRequestPermission={jest.fn()}
        onCancel={jest.fn()}
        error="Permission denied"
      />
    );

    fireEvent.press(findPressableParent(screen.getByText('Open Settings')));

    expect(openURLSpy).toHaveBeenCalledWith('app-settings:');
  });

  it('opens settings on android when permission denied error present', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const openSettingsSpy = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue();

    render(
      <LocationPermissionScreen
        onRequestPermission={jest.fn()}
        onCancel={jest.fn()}
        error="Permission denied"
      />
    );

    fireEvent.press(findPressableParent(screen.getByText('Open Settings')));

    expect(openSettingsSpy).toHaveBeenCalled();
  });

  it('shows loading state on request button', () => {
    render(
      <LocationPermissionScreen
        onRequestPermission={jest.fn()}
        onCancel={jest.fn()}
        isLoading
      />
    );

    const button = findPressableParent(
      screen.getByText('Requesting Permission...')
    );
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});
