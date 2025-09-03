import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { PasswordStep, UsernameStep } from '@/components/auth';
import {
  Button,
  FocusAwareStatusBar,
  Text,
  ThemeToggle,
  View,
} from '@/components/ui';
import { useLoginHandlers } from '@/hooks/use-login-handlers';
import useAuthStore from '@/stores/auth';
import { type Theme, useTheme } from '@/theme';

export default function Login() {
  const router = useRouter();
  const authState = useAuthStore();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [username, setUsername] = useState(__DEV__ ? 'alexis.hills40' : '');
  const [password, setPassword] = useState(__DEV__ ? '12345678' : '');
  const [step, setStep] = useState<'username' | 'password'>('username');

  useEffect(() => {
    if (username && authState.currentRealm) {
      setStep('password');
    }
  }, [username, authState.currentRealm]);

  const handlers = useLoginHandlers({
    authState,
    username,
    password,
    setStep,
    setPassword,
    setUsername,
    router,
  });

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />
      <ThemeToggle style={styles.themeToggle} size="medium" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>AR</Text>
            </View>
            <Text style={styles.appTitle}>AGIL Response</Text>
            <Text style={styles.appSubtitle}>
              Emergency Response Management
            </Text>
          </View>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Sign In</Text>

            {step === 'username' ? (
              <UsernameStep
                username={username}
                setUsername={setUsername}
                onSubmit={handlers.handleUsernameSubmit}
                isLoading={authState.isCheckingUsername}
                error={authState.usernameError}
                onDemoLogin={handlers.handleDemoLogin}
              />
            ) : (
              <PasswordStep
                username={username}
                password={password}
                setPassword={setPassword}
                onSubmit={handlers.handlePasswordSubmit}
                onBack={handlers.handleBackToUsername}
                isLoading={authState.isLoading}
                currentRealm={authState.currentRealm}
              />
            )}
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Secure authentication powered by Keycloak
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Styles
const createStyles = (theme: Theme) => {
  const { colors, spacing, fontSizes, fonts, borderRadius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    themeToggle: {
      position: 'absolute',
      top: 50,
      right: spacing.padding.xxl,
      zIndex: 10,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.padding.xxxl,
      backgroundColor: colors.background.primary,
    },
    headerContainer: { marginBottom: 48, alignItems: 'center' },
    logoContainer: {
      width: 120,
      height: 120,
      marginBottom: spacing.margin.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.round,
      backgroundColor: colors.primary,
    },
    logoText: {
      fontSize: fontSizes.size_28,
      fontFamily: fonts.manropeBold,
      color: colors.semantic.white,
    },
    appTitle: {
      textAlign: 'center',
      fontSize: fontSizes.size_28,
      fontFamily: fonts.manropeBold,
      color: colors.text.primary,
      marginBottom: spacing.margin.lg,
    },
    appSubtitle: {
      textAlign: 'center',
      fontSize: fontSizes.size_16,
      fontFamily: fonts.manropeRegular,
      color: colors.text.secondary,
    },
    loginCard: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.surface.border,
      backgroundColor: colors.surface.card,
      padding: 18,
      ...theme.shadows?.sm,
    },
    loginTitle: {
      marginBottom: spacing.margin.lg,
      fontSize: fontSizes.size_20,
      fontFamily: fonts.manropeSemiBold,
      color: colors.text.primary,
    },
    registerContainer: {
      marginTop: spacing.margin.xxl,
      paddingHorizontal: spacing.padding.lg,
      paddingBottom: spacing.padding.xxl,
    },
    registerText: {
      marginBottom: spacing.margin.lg,
      textAlign: 'center',
      fontSize: fontSizes.size_14,
      fontFamily: fonts.manropeRegular,
      color: colors.text.muted,
    },
    footerContainer: { marginTop: spacing.margin.xxl, alignItems: 'center' },
    footerText: {
      textAlign: 'center',
      fontSize: fontSizes.size_12,
      fontFamily: fonts.manropeRegular,
      color: colors.text.disabled,
    },
  });
};
