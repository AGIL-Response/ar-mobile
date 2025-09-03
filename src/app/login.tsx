import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { PasswordStep, UsernameStep } from '@/components/auth';
import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { showError, showSuccess } from '@/components/ui/utils';
import useAuthStore from '@/stores/auth';

export default function Login() {
  const router = useRouter();
  const authState = useAuthStore();

  const [username, setUsername] = useState(__DEV__ ? 'alexis.hills40' : '');
  const [password, setPassword] = useState(__DEV__ ? '12345678' : '');
  const [step, setStep] = useState<'username' | 'password'>('username');

  useEffect(() => {
    if (username && authState.currentRealm) {
      setStep('password');
    }
  }, [username, authState.currentRealm]);

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

  return (
    <>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-12 items-center">
            <View className="w-30 h-30 mb-6 items-center justify-center rounded-full bg-primary-500">
              <Text className="text-3xl font-bold text-white">AR</Text>
            </View>
            <Text className="text-center text-3xl font-bold text-gray-900">
              AGIL Response
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600">
              Emergency Response Management
            </Text>
          </View>

          <View className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Sign In
            </Text>

            {step === 'username' ? (
              <UsernameStep
                username={username}
                setUsername={setUsername}
                onSubmit={handleUsernameSubmit}
                isLoading={authState.isCheckingUsername}
                error={authState.usernameError}
                onDemoLogin={handleDemoLogin}
              />
            ) : (
              <PasswordStep
                username={username}
                password={password}
                setPassword={setPassword}
                onSubmit={handlePasswordSubmit}
                onBack={handleBackToUsername}
                isLoading={authState.isLoading}
                currentRealm={authState.currentRealm}
              />
            )}
          </View>

          <View className="mt-8 px-4 pb-8">
            <Text className="mb-2 text-center text-gray-500">
              Don't have an account?
            </Text>
            <Button
              label="Register"
              onPress={handleRegister}
              variant="outline"
            />
          </View>

          <View className="mt-8 items-center">
            <Text className="text-center text-xs text-gray-400">
              Secure authentication powered by Keycloak
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
