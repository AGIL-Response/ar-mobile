/**
 * Message Composer Component
 * Input component for sending chat messages
 */

import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { Input, Icon, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import type { SendMessageData } from '@/services/chat';

export interface ComposerProps {
  onSend: (data: Omit<SendMessageData, 'roomId'>) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: { messageId: string; content: string };
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function Composer({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
}: ComposerProps) {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = createStyles(theme, !!message.trim(), isSending, disabled);

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) {
      return;
    }

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    if (onTyping) {
      onTyping(false);
    }

    try {
      await onSend({
        content: messageToSend,
        type: 'text',
        replyTo: replyTo?.messageId,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
      Keyboard.dismiss();
    }
  };

  const handleTextChange = (text: string) => {
    setMessage(text);

    if (onTyping) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set typing to true
      onTyping(true);

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };

  return (
    <View style={styles.container}>
      {replyTo && (
        <View style={styles.replyContainer}>
          <View style={styles.replyContent}>
            <Text variant="caption" style={styles.replyLabel}>
              Replying to
            </Text>
            <Text variant="body" style={styles.replyText} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCancelReply} style={styles.cancelButton}>
            <Icon name="x" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Input
            value={message}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            multiline
            maxLength={5000}
            disabled={disabled || isSending}
            containerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            onSubmitEditing={handleSend}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isSending || disabled}
          style={styles.sendButton}
        >
          <Text style={styles.sendButtonText}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, hasMessage: boolean, isSending: boolean, disabled: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surface.border,
      paddingBottom: theme.spacing.gap.md,
    },
    replyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.gap.md,
      paddingTop: theme.spacing.gap.sm,
      paddingBottom: theme.spacing.gap.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface.border,
    },
    replyContent: {
      flex: 1,
    },
    replyLabel: {
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    replyText: {
      color: theme.colors.text.primary,
      fontSize: 12,
    },
    cancelButton: {
      padding: theme.spacing.gap.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.spacing.gap.md,
      paddingTop: theme.spacing.gap.md,
    },
    inputWrapper: {
      flex: 1,
      marginRight: theme.spacing.gap.sm,
    },
    inputContainerStyle: {
      marginBottom: 0,
    },
    inputStyle: {
      maxHeight: 100,
      paddingTop: theme.spacing.gap.sm,
      paddingBottom: theme.spacing.gap.sm,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.gap.xs,
    },
    sendButtonText: {
      fontSize: 20,
      color: hasMessage && !isSending && !disabled ? 'white' : theme.colors.text.secondary,
    },
  });
