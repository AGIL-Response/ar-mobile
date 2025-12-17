/**
 * Tasks Header Component
 * Header for tasks screen
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

export function TasksHeader() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View testID="tasks-header-container" style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: 56,
      backgroundColor: theme.colors.background.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
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
