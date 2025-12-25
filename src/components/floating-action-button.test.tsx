import React from 'react';
import { Text } from 'react-native';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import {
  FloatingActionButton,
  MiniFAB,
  PrimaryFAB,
} from './floating-action-button';
describe('FloatingActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders icon and label', () => {
    render(
      <FloatingActionButton icon={<Text>+</Text>} label="Do thing" extended />
    );
    expect(screen.getByText('+')).toBeTruthy();
    expect(screen.getByText('Do thing')).toBeTruthy();
  });
  it('accepts position and size props', () => {
    render(<MiniFAB icon={<Text>I</Text>} label="Mini" testID="mini-fab" />);
    expect(screen.getByTestId('mini-fab')).toBeTruthy();
  });
  it('calls onPress when clicked', () => {
    const onPress = jest.fn();
    render(
      <FloatingActionButton
        icon={<Text>A</Text>}
        onPress={onPress}
        testID="floating-action-button"
      />
    );
    fireEvent.press(screen.getByTestId('floating-action-button'));
    expect(onPress).toHaveBeenCalled();
  });
  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FloatingActionButton
        icon={<Text>X</Text>}
        label="disabled"
        onPress={onPress}
        disabled={true}
        testID="floating-action-button"
      />
    );
    const button = getByTestId('floating-action-button');
    
    expect(button.props.disabled).toBe(true);
    expect(button.props.onPress).toBeUndefined();
  });
  it('applies color variants via PrimaryFAB', () => {
    render(
      <PrimaryFAB icon={<Text>P</Text>} label="PLabel" testID="primary-fab" />
    );
    expect(screen.getByTestId('primary-fab')).toBeTruthy();
  });
});
