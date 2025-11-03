import React from 'react';
import { Text } from 'react-native';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import {
  AppBar,
  BottomNavigation,
  HeaderBar,
  SimpleHeader,
  StatusBar,
} from './app-bar';

describe('AppBar', () => {
  it('renders title and default layout', () => {
    render(<AppBar title="My App" />);
    expect(screen.getByText('My App')).toBeTruthy();
  });
  it('renders left, center, right content', () => {
    render(
      <AppBar
        leftContent={<Text>Left</Text>}
        centerContent={<Text>Center</Text>}
        rightContent={<Text>Right</Text>}
      />
    );
    expect(screen.getByText('Left')).toBeTruthy();
    expect(screen.getByText('Center')).toBeTruthy();
    expect(screen.getByText('Right')).toBeTruthy();
  });
  it('shows the back button and responds to press', () => {
    const onBackPress = jest.fn();
    render(<AppBar showBackButton onBackPress={onBackPress} />);
    const btn = screen.getByTestId('mock-icon');
    fireEvent.press(btn);
    expect(onBackPress).toHaveBeenCalled();
  });
  it('applies header/titleAlign left/right/center', () => {
    const { rerender } = render(<AppBar title="A" titleAlign="left" />);
    expect(screen.getByText('A')).toBeTruthy();
    rerender(<AppBar title="B" titleAlign="right" />);
    expect(screen.getByText('B')).toBeTruthy();
    rerender(<AppBar title="C" titleAlign="center" />);
    expect(screen.getByText('C')).toBeTruthy();
  });
});

describe('BottomNavigation', () => {
  const items = [
    { label: 'Home', icon: <Text>🏠</Text> },
    { label: 'Profile', icon: <Text>👤</Text> },
  ];
  it('renders navigation items and activeIndex', () => {
    render(<BottomNavigation items={items} activeIndex={1} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });
});

describe('StatusBar', () => {
  it('renders default props and values', () => {
    render(<StatusBar />);
    expect(screen.getByText('9:41')).toBeTruthy();
    expect(screen.getByText(/\d+%/)).toBeTruthy();
  });
  it('renders battery, time, signal props', () => {
    render(<StatusBar batteryLevel={49} time="10:54" signal="wifi" />);
    expect(screen.getByText('10:54')).toBeTruthy();
    expect(screen.getByText('49%')).toBeTruthy();
    expect(screen.getByText('WiFi')).toBeTruthy();
  });
});

describe('HeaderBar & SimpleHeader', () => {
  it('renders a header via HeaderBar', () => {
    render(<HeaderBar title="HeaderBar" />);
    expect(screen.getByText('HeaderBar')).toBeTruthy();
  });
  it('renders a back button via SimpleHeader', () => {
    const onBack = jest.fn();
    render(<SimpleHeader showBack onBack={onBack} title="Back Title" />);
    expect(screen.getByText('← Back')).toBeTruthy();
    fireEvent.press(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
