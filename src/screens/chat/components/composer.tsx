/**
 * Message Composer Component
 * Input component for sending chat messages
 */

import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Keyboard } from 'react-native';
import { Input, Icon, Text } from '@/components';
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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    <View
      style={{
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surface.border,
        paddingBottom: theme.spacing.gap.md,
      }}
    >
      {replyTo && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.gap.md,
            paddingTop: theme.spacing.gap.sm,
            paddingBottom: theme.spacing.gap.xs,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surface.border,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              variant="caption"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: 2,
              }}
            >
              Replying to
            </Text>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.primary,
                fontSize: 12,
              }}
              numberOfLines={1}
            >
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancelReply}
            style={{
              padding: theme.spacing.gap.xs,
            }}
          >
            <Icon name="x" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: theme.spacing.gap.md,
          paddingTop: theme.spacing.gap.md,
        }}
      >
        <View style={{ flex: 1, marginRight: theme.spacing.gap.sm }}>
          <Input
            value={message}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            multiline
            maxLength={5000}
            disabled={disabled || isSending}
            containerStyle={{
              marginBottom: 0,
            }}
            inputStyle={{
              maxHeight: 100,
              paddingTop: theme.spacing.gap.sm,
              paddingBottom: theme.spacing.gap.sm,
            }}
            onSubmitEditing={handleSend}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isSending || disabled}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.gap.xs,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color:
                message.trim() && !isSending && !disabled
                  ? 'white'
                  : theme.colors.text.secondary,
            }}
          >
            →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

