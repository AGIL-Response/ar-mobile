/**
 * Message Composer Component
 * Input component for sending chat messages with attachment support
 * Supports: camera photo, image/video upload, audio recording
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Keyboard, Alert, StyleSheet } from 'react-native';
import { Input, Text, IconButton } from '@/components';
import { useTheme, type Theme } from '@/theme';
import type { SendMessageData, ChatMessage } from '@/services/chat';
import type { MediaFile } from '@/utils/media';
import { AttachmentPreview } from './attachment-preview';
import useAuthStore from '@/stores/auth';
import { useFileUpload } from '../hooks/use-file-upload';
import { useAudioRecording } from '../hooks/use-audio-recording';
import { useMediaSelection } from '../hooks/use-media-selection';
import { buildLocalMessage, determineMessageType } from '../utils/message-builder';

export interface ComposerProps {
  onSend: (data: Omit<SendMessageData, 'roomId'> & { localMessage?: ChatMessage }) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: { messageId: string; content: string };
  onCancelReply?: () => void;
  disabled?: boolean;
  roomId?: string; // Room ID for creating local messages
}

export function Composer({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  roomId,
}: ComposerProps) {
  const theme = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<MediaFile[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { uploadFiles, uploadProgress, isUploading, resetProgress } = useFileUpload();

  const handleRecordingComplete = useCallback((audioFile: MediaFile) => {
    setAttachments((prev) => [...prev, audioFile]);
  }, []);

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  } = useAudioRecording(handleRecordingComplete);

  const { takePhoto, pickFromGallery } = useMediaSelection();

  const handleSend = useCallback(async () => {
    if ((!message.trim() && attachments.length === 0) || isSending || disabled) {
      return;
    }

    const messageToSend = message.trim();
    const attachmentsToSend = attachments;

    setMessage('');
    setAttachments([]);
    setIsSending(true);
    resetProgress();

    if (onTyping) {
      onTyping(false);
    }

    try {
      const messageType = determineMessageType(attachmentsToSend);
      const { fileIds, localAttachments } = await uploadFiles(attachmentsToSend);

      let localMessage: ChatMessage | undefined;
      if (roomId && currentUser) {
        localMessage = buildLocalMessage({
          roomId,
          content: messageToSend || (attachmentsToSend.length > 0 ? '' : ''),
          type: messageType,
          replyTo: replyTo?.messageId,
          localAttachments,
          attachmentsToSend,
          currentUser: {
            id: currentUser.id || '',
            username: currentUser.username,
            displayName: (currentUser as any).displayName,
            avatarUrl: (currentUser as any).avatarUrl,
          },
        });
      }

      await onSend({
        content: messageToSend || (attachmentsToSend.length > 0 ? '' : ''),
        type: messageType,
        replyTo: replyTo?.messageId,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
        clientId: localMessage?.clientId,
        localMessage,
      });
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setMessage(messageToSend);
      setAttachments(attachmentsToSend);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      resetProgress();
      Keyboard.dismiss();
    }
  }, [
    message,
    attachments,
    isSending,
    disabled,
    roomId,
    currentUser,
    replyTo,
    onSend,
    onTyping,
    uploadFiles,
    resetProgress,
  ]);

  const handleTextChange = useCallback(
    (text: string) => {
      setMessage(text);

      if (onTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        onTyping(true);

        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 3000);
      }
    },
    [onTyping]
  );

  const handleCancelReply = useCallback(() => {
    if (onCancelReply) {
      onCancelReply();
    }
  }, [onCancelReply]);

  const handleTakePhoto = useCallback(async () => {
    const photo = await takePhoto();
    if (photo) {
      setAttachments((prev) => [...prev, photo]);
    }
  }, [takePhoto]);

  const handlePickImage = useCallback(async () => {
    const image = await pickFromGallery();
    if (image) {
      setAttachments((prev) => [...prev, image]);
    }
  }, [pickFromGallery]);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const canSend = (message.trim() || attachments.length > 0) && !isSending && !disabled && !isRecording;
  const styles = createStyles(theme, !!message.trim(), isSending, disabled);

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
          <TouchableOpacity
            onPress={handleCancelReply}
            style={{
              padding: theme.spacing.gap.xs,
            }}
          >
            <Text style={{ color: theme.colors.text.secondary, fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
          uploadProgress={uploadProgress}
          isUploading={isSending && isUploading}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: theme.spacing.gap.md,
          paddingTop: theme.spacing.gap.md,
          gap: theme.spacing.gap.sm,
        }}
      >
        {!isRecording && !message.trim() && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <IconButton
              icon="camera"
              size="large"
              colorVariant="transparent"
              iconColor={theme.colors.button.secondary}
              disabled={disabled || isSending}
              onPress={handleTakePhoto}
              accessibilityLabel="Take photo"
            />

            <IconButton
              icon="image"
              size="large"
              colorVariant="transparent"
              iconColor={theme.colors.button.secondary}
              disabled={disabled || isSending}
              onPress={handlePickImage}
              accessibilityLabel="Pick image"
            />

            <IconButton
              icon="microphone"
              size="large"
              colorVariant="transparent"
              iconColor={theme.colors.button.secondary}
              disabled={disabled || isSending}
              onPress={startRecording}
              accessibilityLabel="Start recording"
            />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Input
            value={message}
            onChangeText={handleTextChange}
            placeholder={isRecording ? 'Recording audio...' : 'Type a message...'}
            multiline
            maxLength={5000}
            disabled={disabled || isSending || isRecording}
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

        {isRecording ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.gap.sm,
            }}
          >
            <IconButton
              icon="x"
              size="medium"
              backgroundColor="#ef4444"
              iconColor="white"
              iconSize={18}
              onPress={cancelRecording}
              accessibilityLabel="Cancel recording"
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.gap.xs,
                paddingHorizontal: theme.spacing.gap.sm,
                paddingVertical: theme.spacing.gap.xs,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: 18,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444',
                }}
              />
              <Text
                variant="caption"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {formatTime(recordingTime)}
              </Text>
            </View>

            <IconButton
              icon="send"
              size="medium"
              colorVariant="transparent"
              iconColor={theme.colors.button.secondary}
              iconSize={18}
              onPress={stopRecording}
              accessibilityLabel="Stop recording and send"
            />
          </View>
        ) : (
          <IconButton
            icon="send"
            size="large"
            colorVariant="transparent"
            disabled={!canSend}
            iconColor={canSend ? theme.colors.button.secondary : theme.colors.text.disabled}
            onPress={handleSend}
            style={{ marginBottom: theme.spacing.gap.xs }}
            accessibilityLabel="Send message"
          />
        )}
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
  });
