import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { showError } from '@/components/ui/utils';
import useAuthStore from '@/stores/auth';

export default function Login() {
  const router = useRouter();

  const authState = useAuthStore();

  const onSubmit: LoginFormProps['onSubmit'] = async (formData) => {
    try {
      await authState.actions.login(formData.username, formData.password);
      router.push('/');
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        'Login failed. Please check your credentials and try again.';
      showError(errorMessage);
      console.error('Login error:', error);
    } finally {
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} isLoading={authState.isLoading} />
      <View className="px-4 pb-8">
        <Text className="mb-2 text-center text-gray-500">
          Don't have an account?
        </Text>
        <Button label="Register" onPress={handleRegister} variant="outline" />
      </View>
    </>
  );
}
