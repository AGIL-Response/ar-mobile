/* eslint-disable react/no-unstable-nested-components */
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Home as HomeIcon,
} from '@/components/ui/icons';
import useAuthStore from '@/stores/auth';

export default function TabLayout() {
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
          tabBarButtonTestID: 'home-tab',
        }}
      />
    </Tabs>
  );
}
