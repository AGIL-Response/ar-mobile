import React from 'react';
import { View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';

type UsernameStepProps = {
  username: string;
  setUsername: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  onDemoLogin: () => void;
};

export function UsernameStep({
  username,
  setUsername,
  onSubmit,
  isLoading,
  error,
  onDemoLogin,
}: UsernameStepProps) {
  return (
    <>
      <Text className="mb-6 text-gray-600">
        Enter your username to access your organization's emergency response
        system.
      </Text>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-medium text-gray-700">Username</Text>
        <Input
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>

      <Button
        label="Continue"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || !username.trim()}
        className="mb-4"
      />

      {__DEV__ && (
        <Button
          label="Demo Login"
          onPress={onDemoLogin}
          variant="outline"
          className="mb-4"
        />
      )}

      {error && (
        <View className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      )}
    </>
  );
}
