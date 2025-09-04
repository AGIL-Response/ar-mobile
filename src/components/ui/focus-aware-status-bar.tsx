import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

import { useIsDarkTheme } from '@/theme';

type Props = { hidden?: boolean, theme?: string };
export const FocusAwareStatusBar = ({ hidden = false, theme }: Props) => {
  const isFocused = useIsFocused();
  const isDark = useIsDarkTheme();
  const style = theme || (isDark ? 'dark' : 'light');

  if (Platform.OS === 'web') return null;

  return isFocused ? (
    <SystemBars style={style as any} hidden={hidden} />
  ) : null;
};
