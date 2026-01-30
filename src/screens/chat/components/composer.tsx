/**
 * Message Composer Component
 * Orchestrates message composition with attachment support
 * Follows SOLID principles: delegates to specialized hooks and components
 */

import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, type Theme } from '@/theme';
import type { SendMessageData, ChatMessage } from '@/services/chat';
import { ComposerReplyBar } from './composer-reply-bar';
import { ComposerActionButtons } from './composer-action-buttons';
import { ComposerRecordingUI } from './composer-recording-ui';
import { ComposerInputArea } from './composer-input-area';
import { useComposerState } from '../hooks/use-composer-state';
import { useComposerSend } from '../hooks/use-composer-send';
import { useComposerTyping } from '../hooks/use-composer-typing';
import { useAudioRecording } from '../hooks/use-audio-recording';
import { useMediaSelection } from '../hooks/use-media-selection';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ComposerProps {
  onSend: (data: Omit<SendMessageData, 'roomId'> & { localMessage?: ChatMessage }) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: { messageId: string; content: string };
  onCancelReply?: () => void;
  disabled?: boolean;
  roomId?: string;
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
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  // State management
  const { message, attachments, setMessage, addAttachment, clearAll, hasContent } =
    useComposerState();

  // Send logic
  const { sendMessage, isSending } = useComposerSend({
    onSend,
    roomId,
    replyTo,
  });

  // Typing indicator
  const { handleTextChange } = useComposerTyping({ onTyping });

  // Track if we should auto-send after recording completes
  const shouldAutoSendRef = useRef(false);

  // Audio recording
  const handleRecordingComplete = useCallback(
    async (audioFile: any) => {
      // If send button was pressed, auto-send immediately without adding to state
      if (shouldAutoSendRef.current) {
        shouldAutoSendRef.current = false;
        try {
          await sendMessage(message, [audioFile]);
          clearAll();
          if (onTyping) {
            onTyping(false);
          }
        } catch {
          // Error already handled in useComposerSend, state preserved
        }
      } else {
        // Only add to state if not auto-sending (user might want to review before sending)
        addAttachment(audioFile);
      }
    },
    [addAttachment, sendMessage, message, clearAll, onTyping]
  );

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  } = useAudioRecording(handleRecordingComplete);

  // Media selection
  const { takePhoto, pickFromGallery } = useMediaSelection();

  // Handlers
  const handleSend = useCallback(async () => {
    try {
      await sendMessage(message, attachments);
      clearAll();
      if (onTyping) {
        onTyping(false);
      }
    } catch {
      // Error already handled in useComposerSend, state preserved
    }
  }, [message, attachments, sendMessage, clearAll, onTyping]);

  const handleTakePhoto = useCallback(async () => {
    const photo = await takePhoto();
    if (photo) {
      addAttachment(photo);
      // Auto-send immediately after selecting photo
      try {
        await sendMessage(message, [photo]);
        clearAll();
        if (onTyping) {
          onTyping(false);
        }
      } catch {
        // Error already handled in useComposerSend, state preserved
      }
    }
  }, [takePhoto, addAttachment, sendMessage, message, clearAll, onTyping]);

  const handlePickImage = useCallback(async () => {
    const image = await pickFromGallery();
    if (image) {
      addAttachment(image);
      // Auto-send immediately after selecting image
      try {
        await sendMessage(message, [image]);
        clearAll();
        if (onTyping) {
          onTyping(false);
        }
      } catch {
        // Error already handled in useComposerSend, state preserved
      }
    }
  }, [pickFromGallery, addAttachment, sendMessage, message, clearAll, onTyping]);

  const handleStopRecording = useCallback(async () => {
    // Set flag to auto-send when recording completes
    shouldAutoSendRef.current = true;
    await stopRecording();
    // Audio will be added and sent via handleRecordingComplete
  }, [stopRecording]);

  const handleTextChangeWithTyping = useCallback(
    (text: string) => {
      setMessage(text);
      handleTextChange(text);
    },
    [setMessage, handleTextChange]
  );

  const canSend = hasContent && !isSending && !disabled && !isRecording;
  const showActionButtons = !isRecording && !message.trim();

  return (
    <View style={styles.container}>
      {replyTo && onCancelReply && (
        <ComposerReplyBar replyTo={replyTo} onCancel={onCancelReply} />
      )}

      {/* {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={removeAttachment}
          uploadProgress={uploadProgress}
          isUploading={isSending && isUploading}
        />
      )} */}

      <View style={styles.inputArea}>
        {showActionButtons && (
          <ComposerActionButtons
            onTakePhoto={handleTakePhoto}
            onPickImage={handlePickImage}
            onStartRecording={startRecording}
            disabled={disabled || isSending}
          />
        )}

        {isRecording ? (
          <ComposerRecordingUI
            recordingTime={recordingTime}
            formatTime={formatTime}
            onCancel={cancelRecording}
            onStop={handleStopRecording}
          />
        ) : (
          <ComposerInputArea
            message={message}
            isRecording={isRecording}
            disabled={disabled || isSending}
            canSend={canSend}
            onTextChange={handleTextChangeWithTyping}
            onSend={handleSend}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
    },
    inputArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.spacing.gap.md,
      paddingVertical: theme.spacing.gap.md,
      gap: theme.spacing.gap.sm,
    },
  });
