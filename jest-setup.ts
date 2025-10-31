import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-ignore
global.window = {};
// @ts-ignore
global.window = global;

// ------------------------------
// Global mocks for common modules
// ------------------------------

// Mock expo-router once for all tests; access push mock via:
jest.mock('expo-router', () => {
  const pushMock = jest.fn();
  return {
    __esModule: true,
    useRouter: () => ({ push: pushMock }),
    __pushMock: pushMock,
  };
});
// Minimal theme mock compatible with our styles; useTheme() returns design tokens
jest.mock('@/theme', () => {
  const minimalTheme = {
    isDark: false,
    colors: {
      primary: '#1068eb',
      white: '#ffffff',
      black: '#000000',
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        tertiary: '#ffffff',
      },
      surface: {
        input: '#ffffff',
        card: '#ffffff',
        border: '#e5e7eb',
        divider: '#e5e7eb',
        disabled: '#f3f4f6',
      },
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        muted: '#9ca3af',
        placeholder: '#9ca3af',
      },
      semantic: {
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        errorBackground: 'rgba(239, 68, 68, 0.1)',
        errorBorder: 'rgba(239, 68, 68, 0.2)',
        white: '#ffffff',
        black: '#000000',
      },
      utility: {
        overlay: 'rgba(0,0,0,0.05)',
        lightGray: '#e5e7eb',
      },
    },
    typography: {
      h1: {
        fontSize: 28,
        lineHeight: 32,
        fontWeight: '700',
        fontFamily: 'System',
      },
      h2: {
        fontSize: 24,
        lineHeight: 28,
        fontWeight: '700',
        fontFamily: 'System',
      },
      h3: {
        fontSize: 20,
        lineHeight: 22,
        fontWeight: '600',
        fontFamily: 'System',
      },
      h4: {
        fontSize: 18,
        lineHeight: 22,
        fontWeight: '600',
        fontFamily: 'System',
      },
      body: { fontSize: 16, lineHeight: 20, fontFamily: 'System' },
      label: { fontSize: 14, lineHeight: 18, fontFamily: 'System' },
      caption: { fontSize: 12, lineHeight: 16, fontFamily: 'System' },
      button: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        fontFamily: 'System',
      },
      overline: { fontSize: 10, lineHeight: 12, fontFamily: 'System' },
    },
    spacing: {
      gap: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
      padding: { xs: 1, sm: 4, md: 6, lg: 8, xl: 12, xxl: 16, xxxl: 24 },
      margin: { md: 12 },
    },
    borderRadius: { sm: 3, md: 4, lg: 8, full: 100 },
    components: {
      input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        padding: { horizontal: 16 },
      },
      button: {
        height: {
          small: 36,
          medium: 48,
          large: 56,
        },
        padding: { horizontal: 16, vertical: 8 },
        borderRadius: 8,
      },
      card: { padding: { medium: 16 } },
    },
  };
  return {
    __esModule: true,
    useTheme: () => minimalTheme,
    useThemeColors: () => minimalTheme.colors,
    useThemeSelection: () => ({ setTheme: jest.fn() }),
    useIsDarkTheme: jest.fn(() => false),
  };
});

jest.mock('react-native-flash-message', () => ({
  __esModule: true,
  showMessage: jest.fn(),
}));

// Mock i18n
jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key: string) => `translated_${key}`),
}));

jest.mock('@/components/icon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    Icon: ({ size = 24, width, height, name, ...props }: any) =>
      React.createElement(
        Text,
        {
          ...props,
          testID: 'mock-icon',
          style: { width: width ?? size, height: height ?? size },
        },
        name
      ),
    iconNames: {},
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    __esModule: true,
    ...actual,
    useIsFocused: jest.fn(() => true),
  };
});

// Global mock for react-native-edge-to-edge SystemBars component
jest.mock('react-native-edge-to-edge', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    SystemBars: ({ style, hidden }: any) =>
      React.createElement(View, {
        testID: 'system-bars',
        'data-style': style,
        'data-hidden': hidden,
      }),
  };
});

// Mock @gorhom/bottom-sheet for Modal component
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function BottomSheetModalMock(
      props: any,
      ref: any
    ) {
      return React.createElement('div', {
        ref,
        'data-testid': 'bottom-sheet-modal',
        ...props,
      });
    }),
    // Add provider passthrough so components/tests using it don't break
    BottomSheetModalProvider: ({ children }: any) =>
      React.createElement(React.Fragment, null, children),
    useBottomSheet: () => ({ close: jest.fn(), snapToIndex: jest.fn() }),
    createBottomSheetScrollableComponent: jest.fn(
      (_type: any, Component: any) => Component
    ),
    SCROLLABLE_TYPE: {
      SCROLLVIEW: 'SCROLLVIEW',
    },
  };
});

// Mock react-native-reanimated for Modal animations
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component: any) => Component,
    },
    // createAnimatedComponent: (Component: any) => Component,
    FadeIn: { duration: jest.fn(() => ({ duration: 50 })) },
    FadeOut: { duration: jest.fn(() => ({ duration: 20 })) },
  };
});

// Mock react-native-keyboard-controller for modal-keyboard-aware-scroll-view
jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  return {
    KeyboardAwareScrollView: ({ children, ...props }: any) =>
      React.createElement(
        'View',
        { testID: 'keyboard-aware-scroll-view', ...props },
        children
      ),
  };
});
