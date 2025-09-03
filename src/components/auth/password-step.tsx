import React from 'react';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';

type PasswordStepProps = {
  username: string;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentRealm: string | null;
};

export function PasswordStep({
  username,
  password,
  setPassword,
  onSubmit,
  onBack,
  isLoading,
  currentRealm,
}: PasswordStepProps) {
  return (
    <>
      <View className="mb-4">
        <Text className="mb-2 text-gray-600">
          Welcome back,{' '}
          <Text className="font-semibold text-gray-900">{username}</Text>
        </Text>
        {currentRealm && (
          <View className="mb-4 flex-row items-center">
            <Text className="mr-2 text-sm text-gray-500">Organization:</Text>
            <View className="rounded-full bg-primary-100 px-3 py-1">
              <Text className="text-sm font-medium text-primary-700">
                {currentRealm}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
        <Input
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>

      <Button
        label="Sign In"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || !password.trim()}
        className="mb-4"
      />

      <Button
        label="Back"
        onPress={onBack}
        variant="outline"
        className="mb-4"
      />
    </>
  );
}
