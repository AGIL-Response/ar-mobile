/**
 * Message Component
 * Displays a single chat message with attachment support
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import type { ChatMessage, ChatAttachment } from '@/services/chat';
import { Avatar, Text, Icon } from '@/components';
import { useTheme, type Theme } from '@/theme';
import useAuthStore from '@/stores/auth';
import { MessageAttachment } from './message-attachment';
import { chatService } from '@/services/chat';

export interface MessageProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showSenderName?: boolean;
  compact?: boolean;
  showDateSeparator?: boolean;
  dateSeparatorText?: string;
  onAttachmentPress?: (attachment: ChatAttachment, index: number) => void;
}

function MessageComponent({
  message,
  showAvatar = true,
  showSenderName = false,
  compact = false,
  showDateSeparator = false,
  dateSeparatorText,
  onAttachmentPress,
}: MessageProps) {
  const theme = useTheme();
  const currentUsername = useAuthStore((state) => state.user?.username);
  const isOwnMessage = message.sender.username === currentUsername;
  const messageStatus = message.status || 'sent';

  const hasAttachments = message.attachments && message.attachments.length > 0;
  
  // #region agent log
  if (hasAttachments) {
    fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message.tsx:40', message: 'Message - hasAttachments TRUE', data: { messageId: message.id, attachmentCount: message.attachments?.length || 0, attachments: message.attachments?.map(a => ({ id: a.id, filename: a.filename, hasUrl: !!a.url, urlLength: a.url?.length || 0 })) || [] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  } else if (message.attachments) {
    fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'message.tsx:43', message: 'Message - hasAttachments FALSE but attachments exist', data: { messageId: message.id, attachmentCount: message.attachments.length, attachments: message.attachments.map(a => ({ id: a.id, filename: a.filename, hasUrl: !!a.url, urlLength: a.url?.length || 0 })) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  }
  // #endregion

  // Handle retry for failed messages
  const handleRetry = async () => {
    if (messageStatus === 'error' && message.clientId) {
      try {
        // Resend the message
        const messageType = message.type === 'system' ? 'text' : message.type;
        await chatService.sendMessage({
          roomId: message.roomId,
          content: message.content,
          type: messageType as 'text' | 'file' | 'image',
          fileIds: message.attachments?.map((att) => att.id),
          clientId: message.clientId, // Use same clientId for retry
        });
      } catch (error) {
        console.error('Failed to retry message:', error);
      }
    }
  };

  // Handle delete for failed messages
  const handleDelete = async () => {
    if (messageStatus === 'error' && message.id) {
      try {
        // Delete from local DB
        const { chatDbService } = await import('@/services/chat');
        await chatDbService.deleteMessage(message.id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };


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

  // Extract avatar URL/ID from sender.avatar object
  // Priority: thumbnail (for performance) > url > id > avatarUrl (deprecated)
  const getAvatarSource = () => {
    if (message.sender.avatar) {
      // Prefer thumbnail for better performance, fallback to url, then id
      if (message.sender.avatar.thumbnail) {
        return { uri: message.sender.avatar.thumbnail };
      }
      if (message.sender.avatar.url) {
        return { uri: message.sender.avatar.url };
      }
      if (message.sender.avatar.id) {
        return message.sender.avatar.id; // Return as fileId
      }
    }
    // Fallback to deprecated avatarUrl
    if (message.sender.avatarUrl) {
      return message.sender.avatarUrl; // Could be URL or fileId
    }
    return undefined;
  };

  const avatarSource = getAvatarSource();
  const avatarFileId = typeof avatarSource === 'string' && !avatarSource.startsWith('http') ? avatarSource : undefined;
  const avatarUri = typeof avatarSource === 'object' ? avatarSource : undefined;

  const styles = createStyles(theme, isOwnMessage, compact, showAvatar, messageStatus);

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
            fileId={avatarFileId}
            source={avatarUri}
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
            <View
              style={[
                {
                  backgroundColor: isOwnMessage
                    ? 'rgba(18, 94, 145, 1)' // iOS blue for own messages
                    : 'rgba(11, 53, 86, 0.4)', // Dark gray for received messages
                  paddingHorizontal: hasAttachments ? 8 : 12,
                  paddingVertical: hasAttachments ? 8 : 8,
                  borderRadius: 18,
                  // More rounded corners, slightly different for own vs received
                  borderTopLeftRadius: isOwnMessage ? 18 : 4,
                  borderTopRightRadius: isOwnMessage ? 4 : 18,
                  borderBottomLeftRadius: 18,
                  borderBottomRightRadius: 18,
                  borderColor: messageStatus === 'error' && isOwnMessage
                    ? '#ef4444' // Error border color
                    : 'rgba(23, 120, 186, 0.4)',
                  borderWidth: messageStatus === 'error' && isOwnMessage ? 2 : 1,
                  maxWidth: '100%',
                  flexShrink: 1,
                  gap: 8,
                  opacity: messageStatus === 'error' && isOwnMessage ? 0.6 : 1, // Reduced opacity for error
                },
              ]}
            >
              {/* Attachments */}
              {hasAttachments && (
                <MessageAttachment
                  attachments={message.attachments!}
                  onPress={onAttachmentPress}
                  isOwnMessage={isOwnMessage}
                />
              )}

              {/* Text content */}
              {message.content && (
                <View style={{ paddingHorizontal: hasAttachments ? 4 : 0 }}>
                  <Text
                    variant="body"
                    style={{
                      color: '#FFFFFF',
                      fontSize: 15,
                      lineHeight: 20,
                    }}
                  >
                    {message.content}
                  </Text>
                </View>
              )}

              {message.editedAt && (
                <Text
                  variant="caption"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 11,
                    marginTop: 2,
                    fontStyle: 'italic',
                    paddingHorizontal: hasAttachments ? 4 : 0,
                  }}
                >
                  (edited)
                </Text>
              )}

              {/* Error status actions (retry and delete) */}
              {isOwnMessage && messageStatus === 'error' && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.gap.sm,
                    marginTop: 4,
                    paddingHorizontal: hasAttachments ? 4 : 0,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleRetry}
                    style={{
                      padding: 4,
                    }}
                  >
                    <Icon
                      name="refresh"
                      size={16}
                      color={theme.colors.text.primary || '#FFFFFF'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{
                      padding: 4,
                    }}
                  >
                    <Icon
                      name="trash"
                      size={16}
                      color={theme.colors.text.primary || '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>
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
      </View >
    </View >
  );
}

const createStyles = (theme: Theme, isOwnMessage: boolean, compact: boolean, showAvatar: boolean, messageStatus?: 'sending' | 'sent' | 'error') =>
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

// Memoize Message component for better scroll performance
export const Message = React.memo(MessageComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.attachments?.length === nextProps.message.attachments?.length &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showSenderName === nextProps.showSenderName &&
    prevProps.compact === nextProps.compact &&
    prevProps.showDateSeparator === nextProps.showDateSeparator &&
    prevProps.dateSeparatorText === nextProps.dateSeparatorText
  );
});
