import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Button, ErrorText, Text, View } from '@/components';
import { type Theme, useTheme } from '@/theme';

type UsernameStepProps = {
  username: string;
  setUsername: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
};

export function UsernameStep({
  username,
  setUsername,
  onSubmit,
  isLoading,
  error,
}: UsernameStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <View style={styles.inputContainer}>
        <Text variant="label" color={theme.colors.text.primary}>
          User Name
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputText}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor={theme.colors.text.muted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </View>
      </View>

      <Button
        title="Continue"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || !username.trim()}
        fullWidth
      />

      {error && (
        <ErrorText variant="caption" centered style={styles.errorWrapper}>
          {error}
        </ErrorText>
      )}
    </>
  );
}

const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius, components } = theme;

  return StyleSheet.create({
    inputContainer: {
      marginBottom: spacing.gap.xl,
    },
    inputWrapper: {
      height: components.input.height,
      backgroundColor: colors.surface.input,
      borderWidth: components.input.borderWidth,
      borderColor: colors.surface.border,
      borderRadius: components.input.borderRadius,
      paddingHorizontal: components.input.padding.horizontal,
      justifyContent: 'center',
    },
    inputText: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    errorWrapper: {
      marginTop: spacing.gap.md,
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.sm,
      backgroundColor: colors.semantic.errorBackground,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.semantic.errorBorder,
    },
  });
};
