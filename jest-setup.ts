// Extend Jest matchers with React Native Testing Library matchers
import '@testing-library/jest-native/extend-expect';

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
    getUserTeams: jest.fn(),
  },
  handleApiError: jest.fn((error) => ({
    message: error.message || 'API Error',
  })),
  taskApi: {
    getTasks: jest.fn(),
    getTask: jest.fn(),
    updateTask: jest.fn(),
    createTask: jest.fn(),
    updateChecklistItem: jest.fn(),
  },
  userApi: {
    getUserRoles: jest.fn(),
    getUsersByTenant: jest.fn(),
  },
  filesApi: {
    uploadIncidentAttachment: jest.fn(),
  },
}));

jest.mock('@/api/files', () => ({
  __esModule: true,
  blobToUri: jest.fn(async () => 'data:image/png;base64,mock'),
  cacheFileUri: jest.fn(),
  getCachedFileUri: jest.fn(async () => null),
  filesApi: {
    viewFile: jest.fn(async () => ({
      blob: { type: 'image/png' },
      type: 'image/png',
    })),
  },
}));

jest.mock('@/stores/auth', () => {
  const defaultAuthStoreState = {
    selectedTeam: {
      id: 'team-1',
      name: 'Alpha Team',
    },
    token: { accessToken: undefined },
    user: undefined,
    tenants: [],
    selectedTenant: null,
    actions: {
      logout: jest.fn(),
    },
  };

  const useAuthStore: any = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultAuthStoreState);
    }
    return defaultAuthStoreState;
  });

  // Add Zustand store methods
  useAuthStore.getState = jest.fn(() => defaultAuthStoreState);
  useAuthStore.setState = jest.fn();
  useAuthStore.subscribe = jest.fn(() => jest.fn());

  return {
    __esModule: true,
    useAuthStore,
    default: useAuthStore,
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
    actions: {
      fetchTasks: jest.fn().mockResolvedValue(undefined),
      fetchTask: jest.fn().mockResolvedValue(undefined),
      createTask: jest.fn().mockResolvedValue({}),
      updateTaskStatus: jest.fn().mockResolvedValue(undefined),
      updateChecklistItem: jest.fn().mockResolvedValue(undefined),
      setActiveTab: jest.fn(),
      clearSelectedTask: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    },
  };

  const useTasksStoreMock = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultTasksStoreState);
    }
    return defaultTasksStoreState;
  });

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
    actions: {
      fetchIncidents: jest.fn().mockResolvedValue(undefined),
      fetchIncident: jest.fn().mockResolvedValue(undefined),
      createIncident: jest.fn().mockResolvedValue({}),
      updateIncident: jest.fn().mockResolvedValue({}),
      deleteIncident: jest.fn().mockResolvedValue(undefined),
      setSelectedIncident: jest.fn(),
      setSearchQuery: jest.fn(),
      setFilters: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    },
  };
  const useIncidentsStoreMock = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultIncidentsStoreState);
    }
    return defaultIncidentsStoreState;
  });
  return {
    __esModule: true,
    useIncidentsStore: useIncidentsStoreMock,
    default: useIncidentsStoreMock,
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
    locationUpdateIntervalMs: 10000,
    lastSentCoordinates: null,
    lastSentAttributes: null,
    actions: {
      requestLocationPermission: jest.fn().mockResolvedValue(true),
      checkLocationPermission: jest.fn().mockResolvedValue(true),
      getCurrentLocation: jest.fn().mockResolvedValue(undefined),
      startLocationMonitoring: jest.fn().mockResolvedValue(undefined),
      stopLocationMonitoring: jest.fn(),
      setLocationUpdateIntervalMs: jest.fn(),
      connectToWebSocket: jest.fn(),
      disconnectFromWebSocket: jest.fn(),
      sendLocationUpdate: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    },
  };

  const useLocationStoreMock: any = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultLocationStoreState);
    }
    return defaultLocationStoreState;
  });

  // Add Zustand store methods
  useLocationStoreMock.getState = jest.fn(() => defaultLocationStoreState);
  useLocationStoreMock.setState = jest.fn();
  useLocationStoreMock.subscribe = jest.fn(() => jest.fn());

  return {
    __esModule: true,
    useLocationStore: useLocationStoreMock,
    default: useLocationStoreMock,
  };
});

jest.mock('@/stores/map', () => {
  const defaultMapStoreState = {
    mapFocusIncidentId: null,
    mapFocusUserId: null,
    flatViewFocusUserId: null,
    isMapReady: false,
    actions: {
      setMapFocusIncident: jest.fn(),
      setMapFocusUserId: jest.fn(),
      setFlatViewFocusUserId: jest.fn(),
      setIsMapReady: jest.fn(),
    },
  };

  const useMapStoreMock = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultMapStoreState);
    }
    return defaultMapStoreState;
  });

  return {
    __esModule: true,
    useMapStore: useMapStoreMock,
    default: {
      getState: jest.fn(() => defaultMapStoreState),
      subscribe: jest.fn(() => jest.fn()),
    },
  };
});

jest.mock('@/stores/notifications', () => {
  const defaultNotificationsStoreState = {
    unreadCount: 0,
    notifications: [],
    isLoading: false,
    error: null,
    actions: {
      fetchNotifications: jest.fn().mockResolvedValue(undefined),
      markNotificationRead: jest.fn().mockResolvedValue(undefined),
      markAllNotificationsRead: jest.fn().mockResolvedValue(undefined),
      getUnreadCount: jest.fn().mockResolvedValue(undefined),
      clearError: jest.fn(),
      reset: jest.fn(),
    },
  };

  const useNotificationsStoreMock = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultNotificationsStoreState);
    }
    return defaultNotificationsStoreState;
  });

  return {
    __esModule: true,
    useNotificationsStore: useNotificationsStoreMock,
    default: {
      getState: jest.fn(() => defaultNotificationsStoreState),
      subscribe: jest.fn(() => jest.fn()),
    },
  };
});

// Mock device-info store
jest.mock('@/stores/device-info', () => {
  const defaultDeviceInfoStoreState = {
    networkSpeedConfig: {
      token: 'mock-token',
      timeout: 10000,
      https: true,
      urlCount: 5,
      bufferSize: 8,
    },
    networkSpeedIntervalMs: 30000,
    networkSpeed: null,
    networkSpeedText: '',
    isCheckingNetworkSpeed: false,
    networkSpeedError: null,
    networkSpeedInterval: null,
    checkNetworkSpeedCallback: null,
    batteryIntervalMs: 60000,
    batteryPercentage: null,
    isCharging: false,
    isCheckingBattery: false,
    batteryError: null,
    batteryInterval: null,
    batteryLevelSubscription: null,
    batteryStateSubscription: null,
    actions: {
      initialize: jest.fn(),
      setNetworkSpeedConfig: jest.fn(),
      setNetworkSpeedIntervalMs: jest.fn(),
      setCheckNetworkSpeedCallback: jest.fn(),
      setNetworkSpeed: jest.fn(),
      setNetworkSpeedError: jest.fn(),
      setCheckingNetworkSpeed: jest.fn(),
      triggerNetworkSpeedCheck: jest.fn(),
      startNetworkSpeedMonitoring: jest.fn(),
      stopNetworkSpeedMonitoring: jest.fn(),
      checkBattery: jest.fn().mockResolvedValue(undefined),
      setBatteryIntervalMs: jest.fn(),
      startBatteryMonitoring: jest.fn(),
      stopBatteryMonitoring: jest.fn(),
      clearError: jest.fn(),
      reset: jest.fn(),
    },
  };

  const mockGetState = jest.fn(() => defaultDeviceInfoStoreState);
  const useDeviceInfoStoreMock = jest.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(defaultDeviceInfoStoreState);
    }
    return defaultDeviceInfoStoreState;
  });
  (useDeviceInfoStoreMock as any).getState = mockGetState;
  return {
    __esModule: true,
    useDeviceInfoStore: useDeviceInfoStoreMock,
    default: {
      getState: mockGetState,
    },
  };
});

jest.mock('@/stores/media-viewer', () => {
  const actions = {
    openMediaViewer: jest.fn(),
  };
  return {
    __esModule: true,
    useMediaViewerStore: jest.fn(() => ({ actions })),
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
        tertiary: '#1068eb',
        inactive: '#ffffff',
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
      button: {
        primary: '#e5e7eb',
        secondary: '#6b7280',
        ghost: '#e5e7eb',
        disabled: '#4b5563',
        border: '#6b7280',
        borderPrimary: '#111827',
        borderSecondary: 'rgba(111, 127, 140, 0.2)',
      },
      status: {
        success: '#00ff00',
        error: '#ff0000',
        warning: '#ffaa00',
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
    fonts: {
      manropeRegular: 'Manrope_400Regular',
      manropeMedium: 'Manrope_500Medium',
      manropeSemiBold: 'Manrope_600SemiBold',
      manropeBold: 'Manrope_700Bold',
      interBold: 'Inter_700Bold',
      sFProText: 'SF Pro Text',
      robotoMedium: 'Roboto_500Medium',
      russoOneRegular: 'RussoOne_400Regular',
      goldmanRegular: 'Goldman_400Regular',
      goldmanBold: 'Goldman_700Bold',
      kdamThmorProRegular: 'KdamThmorPro_400Regular',
    },
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
    goldmanRegular: 'Goldman_400Regular',
    goldmanBold: 'Goldman_700Bold',
    kdamThmorProRegular: 'KdamThmorPro_400Regular',
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
  // Don't require react-native - it triggers Flow parsing errors
  // Use a simple element that React Native Testing Library can handle
  return {
    __esModule: true,
    Icon: ({ size = 24, width, height, name, color, ...props }: any) =>
      React.createElement(
        'Text',
        {
          ...props,
          testID: 'mock-icon',
          'data-size': size,
          'data-color': color,
          'data-name': name,
          style: { width: width ?? size, height: height ?? size },
        },
        name || 'icon'
      ),
    iconNames: {},
  };
});

jest.mock('@assets/images', () => ({
  __esModule: true,
  default: {
    avatar_image: 'avatar.png',
    img_login_background: 'login_background.png',
    img_login_logo: 'login_logo.png',
  },
}));

jest.mock('@/lib/socket', () => ({
  initMapSocket: jest.fn(),
  handleListenMapSocket: jest.fn(),
  sendLocationToSocket: jest.fn(),
  disconnectMapSocket: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  storage: {},
}));

// Mock hooks
jest.mock('@/lib/hooks', () => ({
  __esModule: true,
  useFirebaseNotification: jest.fn(),
  useNotifee: jest.fn(),
  useLocation: jest.fn(),
  useCurrentLocation: jest.fn(),
  useObservable: jest.fn(),
  handleAppOpenEvent: jest.fn().mockResolvedValue(undefined),
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    bottomInset: 0,
  })),
  useOAuthFlow: jest.fn((props: any) => ({
    startLoginFlow: jest.fn(),
    startChangePasswordFlow: jest.fn(),
    isReady: true,
    isProcessing: false,
    username: props?.username,
    redirectUri: 'agilresponse://redirect',
  })),
}));

jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(() => null),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@/constants/keycloak', () => ({
  __esModule: true,
  KEYCLOAK_CONFIG: {
    clientId: 'test-client',
    scopes: ['openid', 'profile'],
    getDiscovery: jest.fn((realm: string) => ({
      authorizationEndpoint: `https://keycloak.test/${realm}/auth`,
      tokenEndpoint: `https://keycloak.test/${realm}/token`,
      revocationEndpoint: `https://keycloak.test/realms/${realm}/protocol/openid-connect/revoke`,
    })),
  },
}));

jest.mock('@/services/chat', () => {
  const mockChatService = {
    disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    chatService: mockChatService,
  };
});

jest.mock('@/services/chat/db-service', () => {
  const mockChatDbService = {
    clearAll: jest.fn(),
  }
  return {
    __esModule: true,
    chatDbService: mockChatDbService,
  };
});