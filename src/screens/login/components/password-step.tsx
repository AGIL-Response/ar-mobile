import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Button, Text, View } from '@/components';
import { type ITenant } from '@/stores/auth';
import { type Theme, useTheme } from '@/theme';

type PasswordStepProps = {
  username: string;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  selectedTenant: ITenant | null;
};

export function PasswordStep({
  username,
  password,
  setPassword,
  onSubmit,
  onBack,
  isLoading,
  selectedTenant,
}: PasswordStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      {/* Welcome back section */}
      <View style={styles.welcomeContainer}>
        <Text variant="h3" color={theme.colors.text.primary}>
          Welcome back,{' '}
          <Text variant="h3" color={theme.colors.primary}>
            {username}
          </Text>
        </Text>
        {selectedTenant && (
          <View style={styles.realmContainer}>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Organization:
            </Text>
            <View style={styles.realmBadge}>
              <Text variant="caption" color={theme.colors.text.primary}>
                {selectedTenant.displayName || selectedTenant.name}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Password input */}
      <View style={styles.inputContainer}>
        <Text variant="label" color={theme.colors.text.primary}>
          Password
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputText}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.text.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </View>
      </View>

      {/* Login button */}
      <Button
        title="Sign In"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading || !password.trim()}
        fullWidth
      />

      {/* Back button */}
      <View style={styles.buttonSpacing}>
        <Button title="Back" onPress={onBack} variant="outline" fullWidth />
      </View>
    </>
  );
}

const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius, components } = theme;

  return StyleSheet.create({
    welcomeContainer: {
      marginBottom: spacing.gap.xl,
    },
    realmContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    realmBadge: {
      backgroundColor: colors.utility.overlay,
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.xs,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: colors.surface.border,
    },
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
    buttonSpacing: {
      marginTop: spacing.gap.md,
    },
  });
};
