import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-ignore
global.window = {};
// @ts-ignore
global.window = global;

// ------------------------------
// Global mocks for common modules
// ------------------------------

jest.mock('@/api', () => ({
  authApi: {
    getAllTenantsByUsername: jest.fn(),
    loginWithKeycloak: jest.fn(),
    getUserProfile: jest.fn(),
    register: jest.fn(),
  },
  handleApiError: jest.fn((error) => ({
    message: error.message || 'API Error',
  })),
  taskApi: {
    getTasks: jest.fn(),
    getTask: jest.fn(),
    updateTask: jest.fn(),
  },
  userApi: {
    getUserRoles: jest.fn(),
    getUsersByTenant: jest.fn(),
  },
}));

jest.mock('@/stores/auth', () => {
  const defaultAuthStoreState = {
    token: { accessToken: undefined },
    user: undefined,
    tenants: [],
    selectedTenant: null,
    actions: {
      logout: jest.fn(),
    },
  };

  const useAuthStoreMock = jest.fn(() => defaultAuthStoreState);
  return {
    __esModule: true,
    useAuthStore: useAuthStoreMock,
    default: useAuthStoreMock,
    getState: jest.fn(() => defaultAuthStoreState),
  };
});

jest.mock('@/stores/tasks', () => {
  const defaultTasksStoreState = {
    tasks: [],
    selectedTask: null,
    isLoading: false,
    isLoadingDetail: false,
    error: null,
    activeTab: 'all',
  };

  const useTasksStoreMock = jest.fn(() => defaultTasksStoreState);

  return {
    __esModule: true,
    useTasksStore: useTasksStoreMock,
    default: useTasksStoreMock,
  };
});

jest.mock('@/stores/incidents', () => {
  const defaultIncidentsStoreState = {
    incidents: [],
    isLoading: false,
    error: null,
  };
  return {
    __esModule: true,
    useIncidentsStore: jest.fn(() => defaultIncidentsStoreState),
    default: jest.fn(() => defaultIncidentsStoreState),
  };
});

jest.mock('@/stores/users', () => {
  const defaultUsersStoreState = {
    users: [],
    isLoading: false,
    error: null,
  };
  return {
    __esModule: true,
    useUsersStore: jest.fn(() => defaultUsersStoreState),
    default: jest.fn(() => defaultUsersStoreState),
  };
});

jest.mock('@/stores/location', () => {
  const defaultLocationStoreState = {
    hasLocationPermission: true,
    isLoading: false,
    error: null,
    currentLocation: null,
    coordinates: null,
    socket: null,
    isSocketConnected: false,
    isMonitoring: false,
    monitoringInterval: null,
  };
  return {
    __esModule: true,
    useLocationStore: jest.fn(() => defaultLocationStoreState),
    default: jest.fn(() => defaultLocationStoreState),
    getState: jest.fn(() => defaultLocationStoreState),
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
      bodyMedium: {
        fontSize: 14,
        lineHeight: 18,
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      bodySmall: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
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
    Palette: {
      primary: '#1068eb',
      primaryLight: '#e8f0fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      white: '#ffffff',
      black: '#000000',
      gainsboro: '#dee2e6',
      lightGray: '#e5e7eb',
      mediumGray: '#6a7178',
      darkGray: '#4b5563',
      darkSlateGray: '#374151',
      whiteSmoke: '#f8f9fa',
      transparent: 'rgba(0,0,0,0)',
    },
  };
});
// Mock i18n
jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key: string) => `translated_${key}`),
}));

jest.mock('@/lib/utils', () => ({
  decodeJWT: jest.fn(),
}));

jest.mock('@/components/utils', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

jest.mock('@/lib/hooks/use-location', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@/lib/fonts', () => ({
  useAppFonts: jest.fn(),
  FontFamilies: {
    manropeRegular: 'Manrope_400Regular',
    manropeMedium: 'Manrope_500Medium',
    manropeSemiBold: 'Manrope_600SemiBold',
    manropeBold: 'Manrope_700Bold',
    russoOneRegular: 'RussoOne_400Regular',
    robotoMedium: 'Roboto_500Medium',
    interBold: 'Inter_700Bold',
    sFProText: 'SF Pro Text',
  },
}));

jest.mock('@/lib/use-theme-config', () => ({
  useThemeConfig: jest.fn(() => ({
    dark: false,
    colors: {
      primary: '#1068eb',
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
      card: '#ffffff',
    },
  })),
}));

jest.mock('@/components/icon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    Icon: ({ size = 24, width, height, name, color, ...props }: any) =>
      React.createElement(
        Text,
        {
          ...props,
          testID: 'mock-icon',
          size,
          color,
          name,
          style: { width: width ?? size, height: height ?? size },
        },
        name
      ),
    iconNames: {},
  };
});

jest.mock('@assets/images', () => ({
  __esModule: true,
  default: { avatar_image: 'avatar.png' },
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const actual = jest.requireActual('@react-navigation/native');
  return {
    __esModule: true,
    ...actual,
    NavigationContainer:
      actual?.NavigationContainer ||
      (({ children }: any) =>
        React.createElement(React.Fragment, null, children)),
    ThemeProvider:
      actual?.ThemeProvider ||
      (({ children }: any) =>
        React.createElement(React.Fragment, null, children)),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    })),
    useRoute: jest.fn(() => ({})),
    DefaultTheme: actual?.DefaultTheme || {},
    DarkTheme: actual?.DarkTheme || {},
  };
});

jest.mock('@/lib/socket', () => ({
  initMapSocket: jest.fn(),
  handleListenMapSocket: jest.fn(),
  sendLocationToSocket: jest.fn(),
  disconnectMapSocket: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  storage: {},
}));
