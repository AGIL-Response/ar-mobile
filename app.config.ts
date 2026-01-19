import path from "path";
import fs from "fs";
import type { ConfigContext, ExpoConfig } from '@expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PRO = process.env.APP_VARIANT === 'production';

const envFile = IS_PRO ? '.env.prod' : '.env.dev'
const envFilePath = path.resolve(__dirname, envFile);

require('dotenv').config({
  path: envFilePath,
});

// Automatically expose all environment variables from .env file
const getAllEnvVars = () => {
  const envVars = {};
  
  // Read the .env file directly to get only variables defined there
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach((line) => {
      // Skip comments and empty lines
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          // Use process.env value (dotenv may have processed it)
          envVars[key] = process.env[key] || value;
        }
      }
    });
  }
  
  return envVars;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_NAME || '[?] AgilResponse ',
  slug: 'agil-response',
  scheme: 'myapp',
  ios: {
    ...config.ios,
    bundleIdentifier: process.env.PACKAGE_NAME,
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    ...config.android,
    package: process.env.PACKAGE_NAME,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2E3C4B',
    },
  },
  icon: './assets/icon.png',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#2E3C4B',
        image: './assets/splash-icon.png',
        imageWidth: 150,
      },
    ],
    [
      'expo-font',
      {
        fonts: ['./assets/fonts/Inter.ttf'],
      },
    ],
    [
      '@rnmapbox/maps',
      process.env.MAPBOX_DOWNLOADS_TOKEN
        ? {
          RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,
        }
        : {},
    ],
    'expo-localization',
    'expo-router',
    ['react-native-edge-to-edge'],
    'expo-video',
    "@react-native-firebase/app",
    "./plugins/withNotifee.js",
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static",
          "buildReactNativeFromSource": true
        },
      }
    ]
  ],
  extra: {
    env: getAllEnvVars(),
  },
});
