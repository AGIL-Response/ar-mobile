import type { RelativePathString, Router } from 'expo-router';
import type * as AuthSession from 'expo-auth-session';

import { showError } from '@/components/utils';

interface UseLoginHandlersProps {
  authState: any;
  username: string;
  setStep: (step: 'username' | 'password') => void;
  setUsername: (username: string) => void;
  router: Router;
}

export const useLoginHandlers = ({
  authState,
  username,
  setStep,
  setUsername,
  router,
}: UseLoginHandlersProps) => {
  const handleUsernameSubmit = async () => {
    authState.actions.clearUsernameError();
    try {
      const realm = await authState.actions.checkUsername(username);
      if (realm) {
        console.log('Username check completed for realm:', realm);
        // Move to OAuth step after username is validated
        setStep('password');
      }
    } catch (error: any) {
      console.error('Username check error:', error);
    }
  };

  const handleOAuthSuccess = async (
    tokenResponse: AuthSession.TokenResponse
  ) => {
    console.log('OAuth flow completed, processing tokens...');
    try {
      await authState.actions.loginWithOAuth(tokenResponse);
      console.log('OAuth login successful, navigating to home...');
      router.navigate('/' as RelativePathString);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Login failed. Please try again.';
      showError(errorMessage);
      console.error('OAuth login error:', error);
    }
  };

  const handleOAuthError = (error: Error) => {
    const errorMessage =
      error?.message || 'Authentication failed. Please try again.';
    showError(errorMessage);
    console.error('OAuth error:', error);
  };

  const handleBackToUsername = () => {
    setStep('username');
    setUsername('');
    authState.actions.clearUsernameError();
    authState.actions.setSelectedTenant(null);
  };

  return {
    handleUsernameSubmit,
    handleOAuthSuccess,
    handleOAuthError,
    handleBackToUsername,
  };
};
