import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Button, Text, View } from '@/components/ui';
import { type Theme, useTheme } from '@/theme';

type PasswordStepProps = {
  username: string;
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentRealm: string | null;
};

export function PasswordStep({
  username,
  password,
  setPassword,
  onSubmit,
  onBack,
  isLoading,
  currentRealm,
}: PasswordStepProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      {/* Welcome back section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Welcome back, <Text style={styles.usernameText}>{username}</Text>
        </Text>
        {currentRealm && (
          <View style={styles.realmContainer}>
            <Text style={styles.realmLabel}>Organization:</Text>
            <View style={styles.realmBadge}>
              <Text style={styles.realmText}>{currentRealm}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Password input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
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
        style={styles.loginButton}
        fullWidth
      />

      {/* Back button */}
      <Button
        title="Back"
        onPress={onBack}
        variant="outline"
        style={styles.backButton}
        fullWidth
      />
    </>
  );
}

const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius, components } = theme;

  return StyleSheet.create({
    welcomeContainer: {
      marginBottom: spacing.gap.xl,
    },
    welcomeText: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.gap.md,
    },
    usernameText: {
      ...typography.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
    },
    realmContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    realmLabel: {
      ...typography.caption,
      color: colors.text.secondary,
      marginRight: spacing.gap.sm,
    },
    realmBadge: {
      backgroundColor: colors.utility.overlay,
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.surface.border,
    },
    realmText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '500',
    },
    inputContainer: {
      marginBottom: spacing.gap.xl,
    },
    inputLabel: {
      ...typography.label,
      color: colors.text.primary,
      marginBottom: spacing.gap.sm,
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
    loginButton: {
      height: components.button.height.medium,
      backgroundColor: colors.primary,
      borderRadius: components.button.borderRadius,
      marginBottom: spacing.gap.md,
    },
    backButton: {
      height: components.button.height.medium,
      borderRadius: components.button.borderRadius,
      borderWidth: 1,
      borderColor: colors.surface.border,
      backgroundColor: 'transparent',
    },
  });
};
