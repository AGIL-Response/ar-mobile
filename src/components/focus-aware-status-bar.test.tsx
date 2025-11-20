import * as Navigation from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import * as Theme from '@/theme';

import { FocusAwareStatusBar } from './focus-aware-status-bar';

describe('FocusAwareStatusBar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Theme, 'useIsDarkTheme').mockReturnValue(false);
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
  });

  it('renders SystemBars when screen is focused', async () => {
    render(<FocusAwareStatusBar />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars).toBeTruthy();
  });

  it('does not render when screen is not focused', () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(false);
    render(<FocusAwareStatusBar />);
    expect(screen.queryByTestId('system-bars')).toBeNull();
  });

  it('returns null on web platform', async () => {
    Platform.OS = 'web';
    render(<FocusAwareStatusBar />);
    expect(screen.queryByTestId('system-bars')).toBeNull();
    Platform.OS = 'ios';
  });

  it('uses light style when theme is light', async () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
    jest.spyOn(Theme, 'useIsDarkTheme').mockReturnValue(false);

    render(<FocusAwareStatusBar />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars.props['data-style']).toBe('light');
  });

  it('uses dark style when theme is dark', async () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
    jest.spyOn(Theme, 'useIsDarkTheme').mockReturnValue(true);

    render(<FocusAwareStatusBar />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars.props['data-style']).toBe('dark');
  });

  it('overrides theme with explicit theme prop', async () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
    jest.spyOn(Theme, 'useIsDarkTheme').mockReturnValue(false); // light theme

    render(<FocusAwareStatusBar theme="dark" />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars.props['data-style']).toBe('dark');
  });

  it('passes hidden prop to SystemBars', async () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
    render(<FocusAwareStatusBar hidden />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars.props['data-hidden']).toBe(true);
  });

  it('defaults hidden to false', async () => {
    jest.spyOn(Navigation, 'useIsFocused').mockReturnValue(true);
    render(<FocusAwareStatusBar />);
    const systemBars = await screen.findByTestId('system-bars');
    expect(systemBars.props['data-hidden']).toBe(false);
  });
});
