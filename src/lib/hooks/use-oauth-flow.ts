/**
 * OAuth 2.0 + PKCE Flow Hook
 * Handles Keycloak authentication using Authorization Code Flow with PKCE
 */

import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { KEYCLOAK_CONFIG } from '@/constants/keycloak';

WebBrowser.maybeCompleteAuthSession();

interface UseOAuthFlowProps {
  realm: string;
  onSuccess: (tokenResponse: AuthSession.TokenResponse) => void;
  onError: (error: Error) => void;
}

export function useOAuthFlow({
  realm,
  onSuccess,
  onError,
}: UseOAuthFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Create the redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'myapp',
  });

  // Create the auth request with PKCE enabled
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KEYCLOAK_CONFIG.clientId,
      scopes: KEYCLOAK_CONFIG.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, // Enable PKCE for security
    },
    realm ? KEYCLOAK_CONFIG.getDiscovery(realm) : null
  );

  console.log('🔐 OAuth Debug Info:');
  console.log('  Redirect URI:', redirectUri);
  console.log('  Realm:', realm);
  console.log('  Request ready:', !!request);
  console.log('  Discovery:', realm ? KEYCLOAK_CONFIG.getDiscovery(realm) : null);

  // Handle the OAuth response
  useEffect(() => {
    if (!response || isProcessing) return;

    if (response.type === 'success') {
      setIsProcessing(true);
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response.type === 'error') {
      onError(
        new Error(
          response.error?.message || response.error?.description || 'OAuth flow failed'
        )
      );
    } else if (response.type === 'dismiss' || response.type === 'cancel') {
      console.log('OAuth flow was dismissed or cancelled by user');
    }
  }, [response]);

  /**
   * Exchange authorization code for access token
   */
  const exchangeCodeForToken = async (code: string) => {
    try {
      if (!request) {
        throw new Error('Auth request not initialized');
      }

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: KEYCLOAK_CONFIG.clientId,
          code,
          redirectUri,
          extraParams: request.codeVerifier
            ? { code_verifier: request.codeVerifier }
            : {},
        },
        KEYCLOAK_CONFIG.getDiscovery(realm)
      );

      setIsProcessing(false);
      onSuccess(tokenResponse);
    } catch (error) {
      setIsProcessing(false);
      onError(error as Error);
    }
  };

  /**
   * Start the OAuth login flow
   */
  const startLoginFlow = async () => {
    if (!request) {
      onError(new Error('Auth request not ready'));
      return;
    }

    try {
      await promptAsync();
    } catch (error) {
      onError(error as Error);
    }
  };

  /**
   * Start the change password flow
   * Opens Keycloak with UPDATE_PASSWORD action
   */
  const startChangePasswordFlow = async () => {
    if (!request || !realm) {
      onError(new Error('Auth request not ready'));
      return false;
    }

    try {
      const discovery = KEYCLOAK_CONFIG.getDiscovery(realm);
      const authUrl = `${discovery.authorizationEndpoint}?client_id=${
        KEYCLOAK_CONFIG.clientId
      }&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${KEYCLOAK_CONFIG.scopes.join(
        '%20'
      )}&kc_action=UPDATE_PASSWORD`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        return true;
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('Password change was cancelled');
        return false;
      }
      return false;
    } catch (error) {
      onError(error as Error);
      return false;
    }
  };

  return {
    startLoginFlow,
    startChangePasswordFlow,
    isReady: !!request && !!realm,
    isProcessing,
    redirectUri,
  };
}

