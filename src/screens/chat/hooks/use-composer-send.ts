/**
 * Hook for handling message sending logic
 * Single Responsibility: Handles send message workflow
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { SendMessageData, ChatMessage } from '@/services/chat';
import type { MediaFile } from '@/utils/media';
import { useFileUpload } from './use-file-upload';
import { buildLocalMessage, determineMessageType } from '../utils/message-builder';
import { isAudio } from '@/utils/media';
import { useAuthStore } from '@/stores/auth';

interface UseComposerSendProps {
  roomId?: string;
  replyTo?: { messageId: string; content: string };
  onSend: (data: Omit<SendMessageData, 'roomId'> & { localMessage?: ChatMessage }) => Promise<void>;
}

interface UseComposerSendReturn {
  isSending: boolean;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  sendMessage: (message: string, attachments: MediaFile[]) => Promise<void>;
}

export function useComposerSend({
  roomId,
  replyTo,
  onSend,
}: UseComposerSendProps): UseComposerSendReturn {
  const [isSending, setIsSending] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { uploadFiles, uploadProgress, isUploading, resetProgress } = useFileUpload();

  const sendMessage = useCallback(
    async (message: string, attachments: MediaFile[]) => {
      const messageToSend = message.trim();
      const attachmentsToSend = attachments;

      if ((!messageToSend && attachmentsToSend.length === 0) || isSending) {
        return;
      }

      setIsSending(true);
      resetProgress();

      try {
        const messageType = determineMessageType(attachmentsToSend);
        const { fileIds, localAttachments } = await uploadFiles(attachmentsToSend);

        // Check if any attachment is an audio file (voice message)
        // Check both filename extension and mimeType for better detection
        const isVoice = attachmentsToSend.some(
          (file) =>
            (file.name && isAudio(file.name)) ||
            (file.mimeType && file.mimeType.toLowerCase().startsWith('audio/'))
        );

        console.log('send message', {
          messageToSend,
          attachmentsToSend,
          messageType,
          fileIds,
          localAttachments,
          isVoice,
        });

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
          isVoice: isVoice || undefined, // Only include if true
        });
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
        throw error; // Re-throw so caller can handle state restoration
      } finally {
        setIsSending(false);
        resetProgress();
        // Keep keyboard open after sending
        // Keyboard.dismiss(); // Commented out to keep keyboard visible
      }
    },
    [isSending, roomId, currentUser, replyTo, onSend, uploadFiles, resetProgress]
  );

  return {
    sendMessage,
    isSending,
    uploadProgress,
    isUploading,
  };
}

