/**
 * Composer Input Area Component
 * Single Responsibility: Renders input field and send button
 */

import React, { useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Input, IconButton } from '@/components';
import { useTheme, type Theme } from '@/theme';

interface ComposerInputAreaProps {
  message: string;
  isRecording: boolean;
  disabled?: boolean;
  canSend: boolean;
  onTextChange: (text: string) => void;
  onSend: () => void;
}

export function ComposerInputArea({
  message,
  isRecording,
  disabled = false,
  canSend,
  onTextChange,
  onSend,
}: ComposerInputAreaProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const inputRef = useRef<TextInput>(null);

  // Handle submit - prevent default behavior that dismisses keyboard
  const handleSubmitEditing = () => {
    if (canSend) {
      onSend();
      // Keep focus to prevent keyboard from dismissing
      // The input will maintain focus because blurOnSubmit={false}
    }
  };

  // Handle send button press - ensure input stays focused
  const handleSendPressIn = () => {
    // Focus input before press completes to prevent keyboard dismissal
    inputRef.current?.focus();
  };

  const handleSendPress = () => {
    // Call onSend
    onSend();
    // Immediately refocus to ensure keyboard stays open
    // This is a backup in case focus was lost
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          ref={inputRef}
          value={message}
          onChangeText={onTextChange}
          placeholder={'Aa...'}
          multiline
          maxLength={5000}
          disabled={disabled || isRecording}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
          returnKeyType="default"
        />
      </View>

      {!isRecording && (
        <IconButton
          icon="send"
          size="large"
          colorVariant="transparent"
          disabled={!canSend}
          iconColor={canSend ? theme.colors.button.secondary : theme.colors.text.disabled}
          onPressIn={handleSendPressIn}
          onPress={handleSendPress}
          style={styles.sendButton}
          accessibilityLabel="Send message"
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.gap.sm,
      flex: 1,
    },
    inputContainer: {
      flex: 1,
    },
    inputWrapper: {
      marginBottom: 0,
    },
    input: {
      maxHeight: 100,
      paddingTop: theme.spacing.gap.sm,
      paddingBottom: theme.spacing.gap.sm,
    },
    sendButton: {
      marginBottom: theme.spacing.gap.xs,
    },
  });

