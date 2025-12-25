import Constants from 'expo-constants';
import type { EnvVars } from './env-types';

const envVars = (Constants.expoConfig?.extra?.env || {}) as EnvVars;

/**
 * Environment variables accessible in the app
 * These are automatically loaded from .env.dev or .env.pro based on APP_VARIANT
 *
 * Usage:
 * - Env.BASE_URL - Access env vars directly with autocomplete
 * - Env.APP_VARIANT - App variant (development/production)
 * - Env.APP_NAME - App name
 * - Env.PACKAGE_NAME - Package name
 *
 * To add a new env var:
 * 1. Add it to .env.dev and .env.pro files
 * 2. Run 'npm run generate:env-types' to regenerate types
 * 3. Access it via Env.YOUR_VAR_NAME with full autocomplete support!
 */
export const Env: EnvVars = {
  ...envVars,
};

