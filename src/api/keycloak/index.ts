/**
 * Keycloak API Module
 * Centralized API calls for Keycloak authentication and session management
 */

import { KEYCLOAK_CONFIG } from '@/constants/keycloak';
import { handleApiError } from '../api-client';

/**
 * Revoke a token with Keycloak
 * Used during logout to invalidate refresh tokens
 */
export async function revokeToken(
  realm: string,
  token: string,
  tokenTypeHint: 'refresh_token' | 'access_token' = 'refresh_token'
): Promise<boolean> {
  try {
    const discovery = KEYCLOAK_CONFIG.getDiscovery(realm);
    
    const revokeParams = new URLSearchParams({
      client_id: KEYCLOAK_CONFIG.clientId,
      token,
      token_type_hint: tokenTypeHint,
    });

    const response = await fetch(discovery.revocationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: revokeParams.toString(),
    });

    if (response.ok) {
      console.log('✅ Token revoked successfully');
      return true;
    } else {
      console.warn('⚠️ Failed to revoke token:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error revoking token:', error);
    throw handleApiError(error);
  }
}

