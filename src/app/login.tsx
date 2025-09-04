import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { PasswordStep, UsernameStep } from '@/components/auth';
import { FocusAwareStatusBar, Text, ThemeToggle, View } from '@/components/ui';
import { useLoginHandlers } from '@/hooks/use-login-handlers';
import useAuthStore from '@/stores/auth';
import { type Theme, useTheme } from '@/theme';
import images from '../../assets/images';

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
    <ImageBackground
      style={styles.container}
      source={images.img_login_background}
    >
      <FocusAwareStatusBar theme={'light'}/>
      <ThemeToggle style={styles.themeToggle} size="medium" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Branding Section */}
          <View style={styles.brandingContainer}>
            <View style={styles.logoContainer}>
              <Image style={styles.logoTriangle} source={images.img_login_logo}/>
            </View>
            <Text style={styles.appTitle}>AR Responder</Text>
            <Text style={styles.appSubtitle}>
              Access your tactical command center.
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.loginFormContainer}>
            {step === 'username' ? (
              <UsernameStep
                username={username}
                setUsername={setUsername}
                onSubmit={handlers.handleUsernameSubmit}
                isLoading={authState.isCheckingUsername}
                error={authState.usernameError}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// Styles
const createStyles = (theme: Theme) => {
  const { colors, spacing, borderRadius } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    themeToggle: {
      position: 'absolute',
      top: 100, // Use safe area top + small margin
      right: spacing.padding.xxl,
      zIndex: 10,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },

    // Branding Section (matches Figma layout)
    brandingContainer: {
      alignItems: 'center',
      marginBottom: 120, // Large gap like in Figma
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 8,
    },
    logoTriangle: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.utility.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.gap.lg,
    },
    logoIcon: {
      ...theme.typography.h3,
      color: colors.text.primary,
    },
    appTitle: {
      ...theme.typography.h1,
      fontFamily: 'RussoOne_400Regular', // Use RussoOne for branding title like in Figma
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.gap.lg,
    },
    appSubtitle: {
      ...theme.typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },

    // Login Form Container
    loginFormContainer: {
      width: '100%',
      maxWidth: 327, // Match Figma width
      alignSelf: 'center',
    },
  });
};
