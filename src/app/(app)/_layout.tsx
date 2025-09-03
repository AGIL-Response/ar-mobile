/**
 * App Layout
 * Main layout for authenticated screens
 */

import { Redirect, Stack } from 'expo-router';
import React from 'react';

import useAuthStore from '@/stores/auth';

export default function AppLayout() {
  const authState = useAuthStore();

  // Redirect to login if not authenticated
  if (!authState.token.accessToken) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
