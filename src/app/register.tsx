import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { useRegister } from '@/api/auth';
import type { RegisterFormProps } from '@/components/register-form';
import { RegisterForm } from '@/components/register-form';
import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { showErrorMessage } from '@/components/ui/utils';

export default function Register() {
  const router = useRouter();
  const { register } = useRegister();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: RegisterFormProps['onSubmit'] = async (formData) => {
    try {
      setIsLoading(true);
      const response = await register({
        action: 'register',
        username: formData.username,
        password: formData.password,
        email: formData.email,
      });

      if (response.success) {
        showErrorMessage('Registration successful! Please login.');
        router.push('/login');
      } else {
        showErrorMessage(
          response.message || 'Registration failed. Please try again.'
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        'Registration failed. Please check your details and try again.';
      showErrorMessage(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <RegisterForm onSubmit={onSubmit} isLoading={isLoading} />
      <View className="px-4 pb-8">
        <Text className="mb-2 text-center text-gray-500">
          Already have an account?
        </Text>
        <Button
          label="Back to Login"
          onPress={handleBackToLogin}
          variant="outline"
        />
      </View>
    </>
  );
}
