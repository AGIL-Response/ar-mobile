import Constants from 'expo-constants';
import type { EnvVars } from './env-types';

const envVars = (Constants.expoConfig?.extra?.env || {}) as EnvVars;

/**
 * Required environment variables that must be present
 * Add variables here that are critical for the app to function
 */
export const REQUIRED_ENV_VARS: string[] = [
  'API_HOST',
  'KEYCLOAK_HOST',
  'KEYCLOAK_CLIENT_ID',
  'APP_VARIANT',
  'PACKAGE_NAME',
  'APP_NAME',
  'BASE_URL',
  'GOOGLE_SERVICES_PLIST',
  'GOOGLE_SERVICES_JSON',
  'MAPBOX_DOWNLOADS_TOKEN',
];

/**
 * Validates that all required environment variables are present
 * @param throwOnMissing - If true, throws an error when vars are missing. Default: false (logs warning)
 * @returns Object with validation result and missing variables
 */
export function validateEnvVars(throwOnMissing = false): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    const value = envVars[varName];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    
    if (throwOnMissing) {
      throw new Error(`Environment validation failed: ${message}`);
    } else {
      console.warn(`⚠️  Environment validation warning: ${message}`);
      console.warn('Please ensure all required variables are set in your .env file');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export const Env: EnvVars = {
  ...envVars,
};

// Automatically validate on module load (warnings only, won't throw)
// This helps catch missing env vars during development
// To disable automatic validation, remove or comment out the code below
// You can still call validateEnvVars() manually when needed
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  validateEnvVars(false);
}

