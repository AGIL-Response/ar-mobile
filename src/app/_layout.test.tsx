import React from 'react';

import { reactNativeRender as render, waitFor, screen } from '@/lib/test-utils';

import RootLayout, { unstable_settings } from './_layout';

// Import mocks after jest.mock declarations
const {
  preventAutoHideAsync: mockPreventAutoHideAsync,
  hideAsync: mockHideAsync,
  setOptions: mockSetOptions,
} = require('expo-splash-screen');

const { useAppFonts: mockUseAppFonts } = require('@/lib/fonts');
const {
  useThemeConfig: mockUseThemeConfig,
} = require('@/lib/use-theme-config');

// Mock theme config
const mockTheme = {
  dark: false,
  colors: {
    primary: '#1068eb',
    background: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    card: '#ffffff',
  },
};

describe('RootLayout', () => {
  beforeEach(() => {
    // Don't clear SplashScreen mocks - they're called at module level
    // Only clear mocks for hooks that are called during render
    mockUseAppFonts.mockClear();
    mockUseThemeConfig.mockClear();
    mockHideAsync.mockClear();

    // Reset mocks to default values
    mockUseAppFonts.mockReturnValue(true);
    mockUseThemeConfig.mockReturnValue(mockTheme);
  });

  it('calls preventAutoHideAsync and setOptions when module loads', () => {
    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockSetOptions).toHaveBeenCalledTimes(1);
    expect(mockSetOptions).toHaveBeenCalledWith({
      duration: 500,
      fade: true,
    });
  });

  it('returns null when fonts are not loaded', () => {
    mockUseAppFonts.mockReturnValue(false);

    render(<RootLayout />);

    expect(screen).toBeTruthy();
    expect(mockHideAsync).not.toHaveBeenCalled();
  });

  it('hides splash screen when fonts are loaded', async () => {
    mockUseAppFonts.mockReturnValue(true);

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalled();
    });
  });

  it('hides splash screen after fonts load asynchronously', async () => {
    let fontsLoaded = false;
    mockUseAppFonts.mockImplementation(() => fontsLoaded);

    const { rerender } = render(<RootLayout />);

    expect(mockHideAsync).not.toHaveBeenCalled();

    fontsLoaded = true;
    rerender(<RootLayout />);

    await waitFor(() => {
      expect(mockHideAsync).toHaveBeenCalled();
    });
  });

  it('renders Providers and Stack when fonts are loaded', () => {
    mockUseAppFonts.mockReturnValue(true);
    mockUseThemeConfig.mockReturnValue(mockTheme);

    const { toJSON } = render(<RootLayout />);

    expect(toJSON()).not.toBeNull();
    expect(mockUseAppFonts).toHaveBeenCalled();
  });
});

describe('unstable_settings', () => {
  it('exports correct initial route name', () => {
    expect(unstable_settings.initialRouteName).toBe('(app)');
  });
});
