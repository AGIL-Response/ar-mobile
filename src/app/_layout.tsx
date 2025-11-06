// Import  global CSS file
import '@/lib/reanimated';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RnSpeedTestProvider, { type RnSpeedTestConfig } from 'rn-speed-test';

import { LocationMonitor } from '@/components/location-monitor';
import { useAppFonts } from '@/lib/fonts';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();

  // Configure network speed test
  const speedTestConfig: RnSpeedTestConfig = {
    token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm',
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: 'MBps',
  };

  return (
    <RnSpeedTestProvider
      initialConfig={speedTestConfig}
      onError={(error) => {
        console.warn('Network speed test error:', error);
      }}
    >
      <GestureHandlerRootView
        style={styles.container}
        className={theme.dark ? `dark` : undefined}
      >
        <KeyboardProvider>
          <ThemeProvider value={theme}>
            <BottomSheetModalProvider>
              <LocationMonitor />
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </RnSpeedTestProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
