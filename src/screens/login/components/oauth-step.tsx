/**
 * OAuth Step Component
 * Shows OAuth login button after username is validated
 */

import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

import { Button, Text, View } from '@/components';
import { type ITenant } from '@/stores/auth';
import { type Theme, useTheme } from '@/theme';

type OAuthStepProps = {
  username: string;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  isReady: boolean;
  isProcessing: boolean;
  selectedTenant: ITenant | null;
};

export function OAuthStep({
  username,
  onSubmit,
  onBack,
  isLoading,
  isReady,
  isProcessing,
  selectedTenant,
}: OAuthStepProps) {
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

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text variant="body" color={theme.colors.text.secondary} centered>
          You will be redirected to a secure login page to authenticate.
        </Text>
      </View>

      {/* OAuth Login button */}
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color={theme.colors.text.secondary}>
            Processing authentication...
          </Text>
        </View>
      ) : (
        <Button
          title="Continue to Sign In"
          onPress={onSubmit}
          loading={isLoading}
          disabled={isLoading || !isReady}
          fullWidth
          variant="outline"
          size="medium"
          colorVariant="secondary"
        />
      )}

      {/* Back button */}
      {!isProcessing && (
        <View style={styles.buttonSpacing}>
          <Button
            title="Back"
            onPress={onBack}
            variant="outline"
            fullWidth
            size="medium"
            colorVariant="disabled"
            disabled={isLoading}
          />
        </View>
      )}
    </>
  );
}

const createStyles = (theme: Theme) => {
  const { colors, spacing, borderRadius } = theme;

  return StyleSheet.create({
    welcomeContainer: {
      marginBottom: spacing.gap.xl,
    },
    realmContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.gap.sm,
    },
    realmBadge: {
      backgroundColor: colors.utility.overlay,
      paddingHorizontal: spacing.padding.md,
      paddingVertical: spacing.padding.xs,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: colors.surface.border,
      marginLeft: spacing.gap.sm,
    },
    instructionsContainer: {
      marginBottom: spacing.gap.xl,
      paddingHorizontal: spacing.padding.md,
    },
    processingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.padding.xl,
      gap: spacing.gap.md,
    },
    buttonSpacing: {
      marginTop: spacing.gap.md,
    },
  });
};

