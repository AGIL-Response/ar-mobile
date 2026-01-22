/**
 * Mock for expo-constants
 * Provides access to system and app constants in test environment
 */

export default {
  // App metadata
  appOwnership: 'standalone',
  expoVersion: '51.0.0',
  installationId: 'mock-installation-id',
  sessionId: 'mock-session-id',
  
  // Manifest / App config
  manifest: {
    name: 'AR Mobile',
    slug: 'ar-mobile',
    version: '1.0.0',
    extra: {
      apiUrl: 'https://api.example.com',
    },
  },
  
  manifest2: {
    extra: {
      expoClient: {
        name: 'AR Mobile',
        slug: 'ar-mobile',
        version: '1.0.0',
      },
    },
  },
  
  expoConfig: {
    name: 'AR Mobile',
    slug: 'ar-mobile',
    version: '1.0.0',
    extra: {
      apiUrl: 'https://api.example.com',
      env: {}, // Add env property for env tests
    },
  },
  
  // Platform info
  platform: {
    ios: {
      platform: 'ios',
      model: 'iPhone',
      userInterfaceIdiom: 'phone',
    },
    android: {
      versionCode: 1,
    },
  },
  
  // Device info
  deviceName: 'Mock Device',
  deviceYearClass: 2023,
  isDevice: true,
  
  // System info
  systemVersion: '17.0',
  systemFonts: ['System'],
  
  // Status bar height
  statusBarHeight: 44,
  
  // Get native constants
  getWebViewUserAgentAsync: jest.fn().mockResolvedValue('Mock UserAgent'),
};

// Named exports for specific constants
export const appOwnership = 'standalone';
export const expoVersion = '51.0.0';
export const installationId = 'mock-installation-id';
export const sessionId = 'mock-session-id';
export const statusBarHeight = 44;
export const systemVersion = '17.0';
export const deviceName = 'Mock Device';
export const deviceYearClass = 2023;
export const isDevice = true;

// Platform-specific exports
export const platform = {
  ios: {
    platform: 'ios',
    model: 'iPhone',
    userInterfaceIdiom: 'phone',
  },
  android: {
    versionCode: 1,
  },
};

// Manifest exports
export const manifest = {
  name: 'AR Mobile',
  slug: 'ar-mobile',
  version: '1.0.0',
  extra: {
    apiUrl: 'https://api.example.com',
  },
};

export const expoConfig = {
  name: 'AR Mobile',
  slug: 'ar-mobile',
  version: '1.0.0',
  extra: {
    apiUrl: 'https://api.example.com',
    env: {}, // Add env property for env tests
  },
};

// Methods
export const getWebViewUserAgentAsync = jest.fn().mockResolvedValue('Mock UserAgent');

