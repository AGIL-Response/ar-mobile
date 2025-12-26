/**
 * Reply Bar Component
 * Single Responsibility: Displays and handles reply UI
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from '@/components';
import { useTheme, type Theme } from '@/theme';

interface ComposerReplyBarProps {
  replyTo: { messageId: string; content: string };
  onCancel: () => void;
}

export function ComposerReplyBar({ replyTo, onCancel }: ComposerReplyBarProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="caption" style={styles.label}>
          Replying to
        </Text>
        <Text variant="body" style={styles.text} numberOfLines={1}>
          {replyTo.content}
        </Text>
      </View>
      <IconButton
        icon="x"
        size="small"
        colorVariant="transparent"
        iconColor={theme.colors.text.secondary}
        onPress={onCancel}
        accessibilityLabel="Cancel reply"
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.gap.md,
      paddingTop: theme.spacing.gap.sm,
      paddingBottom: theme.spacing.gap.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface.border,
    },
    content: {
      flex: 1,
    },
    label: {
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: 12,
    },
  });

