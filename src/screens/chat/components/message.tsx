/**
 * Message Component
 * Displays a single chat message
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import type { ChatMessage } from '@/services/chat';
import { Avatar, Text, View } from '@/components';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/stores/auth';

export interface MessageProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  compact?: boolean;
  showDateSeparator?: boolean;
  dateSeparatorText?: string;
}

export function Message({ message, showAvatar = true, showSenderName = false, compact = false, showDateSeparator = false, dateSeparatorText }: MessageProps) {
  const theme = useTheme();
  const currentUsername = useAuthStore((state) => state.user?.username);
  const isOwnMessage = message.sender.username === currentUsername;
  const styles = createStyles(theme, isOwnMessage, compact, showAvatar);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Get sender initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Date Separator */}
      {showDateSeparator && dateSeparatorText && (
        <View style={styles.dateSeparatorContainer}>
          <View style={styles.dateSeparatorBadge}>
            <Text variant="caption" style={styles.dateSeparatorText}>
              {dateSeparatorText}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.messageRow}>
        {/* Left side: Avatar for received messages */}
        {!isOwnMessage && (
          <Avatar
            fileId={message.sender.avatarUrl}
            size="small"
            fallback={getInitials(message.sender.displayName || message.sender.username)}
            showStatus={false}
            style={styles.avatar}
          />
        )}

        {/* Message content container */}
        <View style={styles.contentContainer}>
          {/* Sender name for group chats (left-aligned messages only) */}
          {!isOwnMessage && showSenderName && (
            <Text variant="caption" style={styles.senderName}>
              {message.sender.displayName || message.sender.username || 'Unknown'}
            </Text>
          )}

          {/* Reply preview */}
          {message.replyTo && (
            <View style={styles.replyPreview}>
              <Text
                variant="caption"
                style={styles.replyPreviewText}
                numberOfLines={1}
              >
                Replying to message
              </Text>
            </View>
          )}

          {/* Bubble and timestamp container - horizontal alignment */}
          <View style={styles.bubbleContainer}>
            {/* Timestamp for own messages (left side of bubble) */}
            {isOwnMessage && (
              <Text variant="caption" style={styles.timestampOwn}>
                {formatTime(message.timestamp)}
              </Text>
            )}

            {/* Message bubble */}
            <View style={styles.bubble}>
              {message.type === 'image' && message.attachments && message.attachments.length > 0 ? (
                <View>
                  <Text variant="body" style={styles.messageText}>
                    {message.content || '📷 Image'}
                  </Text>
                  {/* TODO: Add image preview component */}
                </View>
              ) : message.type === 'file' && message.attachments && message.attachments.length > 0 ? (
                <View>
                  <Text variant="body" style={styles.messageText}>
                    📎 {message.attachments[0].filename}
                  </Text>
                </View>
              ) : (
                <Text variant="body" style={styles.messageText}>
                  {message.content}
                </Text>
              )}

              {message.editedAt && (
                <Text variant="caption" style={styles.editedText}>
                  (edited)
                </Text>
              )}
            </View>

            {/* Timestamp for received messages (right side of bubble) */}
            {!isOwnMessage && (
              <Text variant="caption" style={styles.timestampReceived}>
                {formatTime(message.timestamp)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, isOwnMessage: boolean, compact: boolean, showAvatar: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    dateSeparatorContainer: {
      alignItems: 'center',
      marginVertical: 16,
      paddingHorizontal: 16,
    },
    dateSeparatorBadge: {
      backgroundColor: theme.colors.background.secondary || 'rgba(0,0,0,0.3)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    dateSeparatorText: {
      color: theme.colors.text.secondary || '#8E8E93',
      fontSize: 12,
      fontWeight: '500',
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: compact ? 4 : 12,
      paddingHorizontal: 16,
      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      width: '100%',
    },
    avatar: {
      marginRight: 8,
      opacity: showAvatar ? 1 : 0,
    },
    contentContainer: {
      flexShrink: 1,
      maxWidth: '75%',
      alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
    },
    senderName: {
      color: theme.colors.text.secondary || '#8E8E93',
      marginBottom: 4,
      marginLeft: 4,
      fontSize: 13,
      fontWeight: '500',
    },
    replyPreview: {
      marginBottom: 4,
      padding: 8,
      backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary || '#007AFF',
    },
    replyPreviewText: {
      color: isOwnMessage ? 'rgba(255,255,255,0.8)' : theme.colors.text.secondary,
      fontSize: 11,
    },
    bubbleContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      maxWidth: '100%',
      flexShrink: 1,
    },
    timestampOwn: {
      color: theme.colors.text.secondary,
      opacity: 0.5,
      fontSize: 11,
      marginRight: 12,
      minWidth: 40,
      textAlign: 'right',
      flexShrink: 0,
    },
    timestampReceived: {
      color: theme.colors.text.secondary,
      opacity: 0.5,
      fontSize: 11,
      marginLeft: 12,
      minWidth: 40,
      textAlign: 'left',
      flexShrink: 0,
    },
    bubble: {
      backgroundColor: isOwnMessage
        ? 'rgba(18, 94, 145, 1)'
        : 'rgba(11, 53, 86, 0.4)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      borderTopLeftRadius: isOwnMessage ? 18 : 4,
      borderTopRightRadius: isOwnMessage ? 4 : 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      borderColor: 'rgba(23, 120, 186, 0.4)',
      borderWidth: 1,
      maxWidth: '100%',
      flexShrink: 1,
    },
    messageText: {
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 20,
    },
    editedText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 11,
      marginTop: 2,
      fontStyle: 'italic',
    },
  });
