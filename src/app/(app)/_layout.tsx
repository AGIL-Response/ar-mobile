/* eslint-disable react/no-unstable-nested-components */
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { Pressable, Text } from '@/components/ui';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib';
import useAuthStore from '@/stores/auth';

export default function TabLayout() {
  const [isFirstTime] = useIsFirstTime();
  const authState = useAuthStore();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      if (hideSplash) {
        hideSplash();
      }
    }, 1000);
  }, []);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (!authState.token.accessToken) {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          headerRight: () => <CreateIncidentLink />,
          tabBarButtonTestID: 'home-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

const CreateIncidentLink = () => {
  return (
    <Link href="/incident/create-incident" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
};
