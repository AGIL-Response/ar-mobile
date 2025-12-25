import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/theme';

const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: '#FFA766', // primary[200] equivalent
    background: '#121212', // charcoal[950] equivalent
    text: '#E5E5E5', // charcoal[100] equivalent
    border: '#7D7D7D', // charcoal[500] equivalent
    card: '#2E2E2E', // charcoal[850] equivalent
  },
};

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF8933', // primary[400] equivalent
    background: '#ffffff',
  },
};

export function useThemeConfig() {
  const colorScheme = useColorScheme();

  if (colorScheme === 'dark') return DarkTheme;

  return LightTheme;
}
