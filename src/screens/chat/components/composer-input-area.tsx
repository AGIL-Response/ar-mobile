/**
 * Composer Input Area Component
 * Single Responsibility: Renders input field and send button
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          value={message}
          onChangeText={onTextChange}
          placeholder={isRecording ? 'Recording audio...' : 'Type a message...'}
          multiline
          maxLength={5000}
          disabled={disabled || isRecording}
          containerStyle={styles.inputWrapper}
          inputStyle={styles.input}
          onSubmitEditing={onSend}
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
          onPress={onSend}
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

