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
  username?: string;
  onSuccess: (tokenResponse: AuthSession.TokenResponse) => void;
  onError: (error: Error) => void;
}

export function useOAuthFlow({
  realm,
  username,
  onSuccess,
  onError,
}: UseOAuthFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Create the redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'agilresponse',
    path: 'redirect',
  });

  // Create the auth request with PKCE enabled
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KEYCLOAK_CONFIG.clientId,
      scopes: KEYCLOAK_CONFIG.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, // Enable PKCE for security
      extraParams: username ? { login_hint: username } : {},
    },
    realm ? KEYCLOAK_CONFIG.getDiscovery(realm) : null
  );

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
      // Build auth URL with PKCE parameters
      const params = new URLSearchParams({
        client_id: KEYCLOAK_CONFIG.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: KEYCLOAK_CONFIG.scopes.join(' '),
        kc_action: 'UPDATE_PASSWORD',
        // PKCE parameters (required!)
        code_challenge: request.codeChallenge || '',
        code_challenge_method: request.codeChallengeMethod || 'S256',
        state: request.state || '',
      });

      // Add login_hint if username is provided
      if (username) {
        params.append('login_hint', username);
      }

      const discovery = KEYCLOAK_CONFIG.getDiscovery(realm);
      const authUrl = `${discovery.authorizationEndpoint}?${params.toString()}`;

      console.log('🔐 Change Password URL:', authUrl);

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

