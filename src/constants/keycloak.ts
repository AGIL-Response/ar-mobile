/**
 * Keycloak Configuration Constants
 * Centralized configuration for OAuth 2.0 + PKCE authentication
 */

import Constants from 'expo-constants';

const env = Constants.expoConfig?.extra?.env || {};

export const KEYCLOAK_CONFIG = {
  host: env.KEYCLOAK_HOST || 'https://dev-auth.agilres.net', 
  clientId: 'ar_app',
  scopes: ['openid'],

  /**
   * Get OAuth discovery endpoints for a specific realm
   */
  getDiscovery: (realm: string) => ({
    authorizationEndpoint: `${KEYCLOAK_CONFIG.host}/realms/${realm}/protocol/openid-connect/auth`,
    tokenEndpoint: `${KEYCLOAK_CONFIG.host}/realms/${realm}/protocol/openid-connect/token`,
    revocationEndpoint: `${KEYCLOAK_CONFIG.host}/realms/${realm}/protocol/openid-connect/revoke`,
    endSessionEndpoint: `${KEYCLOAK_CONFIG.host}/realms/${realm}/protocol/openid-connect/logout`,
    userInfoEndpoint: `${KEYCLOAK_CONFIG.host}/realms/${realm}/protocol/openid-connect/userinfo`,
  }),
};

