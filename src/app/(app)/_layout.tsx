/**
 * App Layout
 * Main layout for authenticated screens
 */

import { Redirect, Stack } from 'expo-router';
import React from 'react';

import useAuthStore from '@/stores/auth';
import { handleAppOpenEvent } from '@/lib/hooks';

export default function AppLayout() {
  const authState = useAuthStore();

  // Check for initial notification when app layout mounts (user is authenticated)
  React.useEffect(() => {
    if (authState.token?.accessToken) {
      handleAppOpenEvent().catch(console.error);
    }
  }, [authState.token?.accessToken]);

  // Redirect to login if not authenticated
  if (!authState.token.accessToken) {
    return <Redirect href={'/login' as any} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="members"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="incidents"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="incidents/create"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="incidents/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/change-password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/create"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat/[roomId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
