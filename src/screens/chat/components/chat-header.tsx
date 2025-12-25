/**
 * Chat Header Component
 * Header for chat screen
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ChatHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
    </View>
  );
}

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: {
      paddingTop: topInset,
      minHeight: 56 + topInset,
      backgroundColor: theme.colors.background.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface.border,
    },
    title: {
      fontSize: 20,
      color: theme.colors.text.primary,
      fontWeight: '600',
      fontFamily: 'Manrope-SemiBold',
    },
  });
