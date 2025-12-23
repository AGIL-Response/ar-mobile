// @ts-nocheck
import React from 'react';
import { Alert, Text } from 'react-native';

import { reactNativeRender as render, fireEvent, screen, waitFor, act } from '@/lib/test-utils';

import { CustomAlertProvider } from './custom-alert-provider';

describe('CustomAlertProvider', () => {
  it('overrides Alert.alert and renders a centered modal with buttons', () => {
    const onOk = jest.fn();

    render(
      <CustomAlertProvider>
        <Text>App content</Text>
      </CustomAlertProvider>
    );

    act(() => {
      Alert.alert('Title', 'Message', [{ text: 'OK', onPress: onOk }]);
    });

    waitFor(() => {
      expect(screen.getByText('Title')).toBeTruthy();
      expect(screen.getByText('Message')).toBeTruthy();
      const okButton = screen.getByText('OK');
      fireEvent.press(okButton);

      expect(onOk).toHaveBeenCalled();
    });
  });

  it('queues multiple alerts and processes them one by one', () => {
    const first = jest.fn();
    const second = jest.fn();

    render(
      <CustomAlertProvider>
        <Text>App content</Text>
      </CustomAlertProvider>
    );

    act(() => {
      Alert.alert('First', 'One', [{ text: 'OK', onPress: first }]);
      Alert.alert('Second', 'Two', [{ text: 'OK', onPress: second }]);
    });

    waitFor(() => {
      expect(screen.getByText('First')).toBeTruthy();
      fireEvent.press(screen.getByText('OK'));
      expect(first).toHaveBeenCalled();
  
      expect(screen.getByText('Second')).toBeTruthy();
      fireEvent.press(screen.getByText('OK'));
      expect(second).toHaveBeenCalled();
    });

  });
});
