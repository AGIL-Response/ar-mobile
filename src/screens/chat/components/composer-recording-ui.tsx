/**
 * Composer Recording UI Component
 * Single Responsibility: Displays recording controls and timer
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from '@/components';
import { useTheme, type Theme } from '@/theme';

interface ComposerRecordingUIProps {
  recordingTime: number;
  formatTime: (seconds: number) => string;
  onCancel: () => void;
  onStop: () => void;
}

export function ComposerRecordingUI({
  recordingTime,
  formatTime,
  onCancel,
  onStop,
}: ComposerRecordingUIProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <IconButton
        icon="x"
        size="medium"
        iconColor="white"
        iconSize={18}
        backgroundColor={theme.colors.semantic.error}
        onPress={onCancel}
        accessibilityLabel="Cancel recording"
      />

      <View style={styles.timerContainer}>
        <View style={styles.indicator} />
        <Text variant="caption" style={styles.timer}>
          {formatTime(recordingTime)}
        </Text>
      </View>

      <IconButton
        icon="send"
        size="medium"
        colorVariant="transparent"
        iconColor={theme.colors.text.inverse}
        backgroundColor={theme.colors.button.secondary}
        iconSize={18}
        onPress={onStop}
        accessibilityLabel="Stop recording and send"
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.gap.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.gap.lg,
    },
    timerContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.gap.xs,
      paddingHorizontal: theme.spacing.gap.lg,
      paddingVertical: theme.spacing.gap.lg,
      backgroundColor: theme.colors.background.overlay,
      borderRadius: 18,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ef4444',
    },
    timer: {
      color: theme.colors.text.primary,
      fontFamily: 'monospace',
      fontSize: 12,
    },
  });

