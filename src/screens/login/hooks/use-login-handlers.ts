import type { Router } from 'expo-router';
import { Alert } from 'react-native';

import { showError, showSuccess } from '@/components/ui/utils';

interface UseLoginHandlersProps {
  authState: any;
  username: string;
  password: string;
  setStep: (step: 'username' | 'password') => void;
  setPassword: (password: string) => void;
  setUsername: (username: string) => void;
  router: Router;
}

export const useLoginHandlers = ({
  authState,
  username,
  password,
  setStep,
  setPassword,
  setUsername,
  router,
}: UseLoginHandlersProps) => {
  const handleUsernameSubmit = async () => {
    authState.actions.clearUsernameError();
    try {
      const realm = await authState.actions.checkUsername(username);
      if (realm) {
        console.log('Username check completed for realm:', realm);
      }
    } catch (error: any) {
      console.error('Username check error:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    console.log('Login screen: Starting login process for username:', username);
    try {
      await authState.actions.loginWithPassword(username, password);
      showSuccess('Login successful!');
      router.push('/');
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        'Login failed. Please check your credentials and try again.';
      showError(errorMessage);
      console.error('Login error:', error);
    }
  };

  const handleBackToUsername = () => {
    setStep('username');
    setPassword('');
    authState.actions.clearUsernameError();
    authState.actions.setCurrentRealm(null);
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleDemoLogin = () => {
    setUsername('alexis.hills40');
  };

  return {
    handleUsernameSubmit,
    handlePasswordSubmit,
    handleBackToUsername,
    handleRegister,
    handleDemoLogin,
  };
};
