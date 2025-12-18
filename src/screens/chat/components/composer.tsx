/**
 * Message Composer Component
 * Input component for sending chat messages with attachment support
 * Supports: camera photo, image/video upload, audio recording
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Keyboard, Alert, AppState } from 'react-native';
import { Input, Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import type { SendMessageData } from '@/services/chat';
import type { MediaFile } from '@/utils/media';
import { validateMediaFile, getMediaType, getMimeType, ensureFileExtension } from '@/utils/media';
import { AttachmentPreview } from './attachment-preview';
import { AudioRecorder } from '@/utils/audioRecorder';
import { useCameraPermission, useMediaLibraryPermission } from '@/lib/media-permissions';

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
  const [attachments, setAttachments] = useState<MediaFile[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  // Permission hooks
  const verifyCameraPermission = useCameraPermission();
  const verifyMediaLibraryPermission = useMediaLibraryPermission();

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || isSending || disabled) {
      return;
    }

    const messageToSend = message.trim();
    const attachmentsToSend = attachments;

    console.log('📤 Sending message with attachments:', {
      messageLength: messageToSend.length,
      attachmentCount: attachmentsToSend.length,
      attachments: attachmentsToSend,
    });

    setMessage('');
    setAttachments([]);
    setIsSending(true);

    if (onTyping) {
      onTyping(false);
    }

    try {
      // Determine message type based on attachments
      let messageType: 'text' | 'file' | 'image' = 'text';
      if (attachmentsToSend.length > 0) {
        const firstAttachmentType = getMediaType(attachmentsToSend[0].name);
        messageType = firstAttachmentType === 'image' || firstAttachmentType === 'video'
          ? 'image'
          : 'file';
        console.log('📎 Message type determined:', messageType, 'from', firstAttachmentType);
      }

      // Convert MediaFile to File objects for the API
      const files: File[] = attachmentsToSend.map((attachment) => {
        // For React Native, we need to create a File-like object
        return {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType || getMimeType(attachment.name),
        } as any;
      });

      console.log('📤 Sending to API with files:', files);

      await onSend({
        content: messageToSend || (attachmentsToSend.length > 0 ? '' : ''),
        type: messageType,
        replyTo: replyTo?.messageId,
        attachments: files.length > 0 ? files : undefined,
      });

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message and attachments on error
      setMessage(messageToSend);
      setAttachments(attachmentsToSend);
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset recording state
  const resetRecordingState = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.destroy();
      audioRecorderRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetRecordingState();
    };
  }, []);

  // Handle camera capture
  const handleTakePhoto = async () => {
    try {
      const hasPermission = await verifyCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please grant permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'] as any, // Using string literals for new API
        allowsEditing: true,
        quality: 0.8,
        videoQuality: 1, // 1 = highest quality, 0 = lowest quality
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const baseName = asset.fileName || `camera_${Date.now()}`;
        const fileName = ensureFileExtension(baseName, mimeType);

        const newAttachment: MediaFile = {
          uri: asset.uri,
          name: fileName,
          type: asset.type || 'image',
          size: asset.fileSize || 0,
          mimeType,
        };

        const validation = validateMediaFile(newAttachment);
        if (validation.valid) {
          setAttachments((prev) => [...prev, newAttachment]);
          console.log('📷 Added camera photo/video');
        } else {
          Alert.alert('Invalid file', validation.error || 'File validation failed');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to take photo';

      // Handle specific error cases
      if (errorMessage.includes('simulator') || errorMessage.includes('not available')) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on this device or simulator. Please use a physical device or select from gallery instead.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  // Handle image/video pick from gallery (single selection only)
  const handlePickImage = async () => {
    try {
      const hasPermission = await verifyMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'] as any, // Using string literals for new API
        allowsMultipleSelection: false, // Only allow 1 photo/video
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        const baseName = asset.fileName || `media_${Date.now()}`;
        const fileName = ensureFileExtension(baseName, mimeType);

        const newAttachment: MediaFile = {
          uri: asset.uri,
          name: fileName,
          type: asset.type || 'image',
          size: asset.fileSize || 0,
          mimeType,
        };

        // Validate the file
        const validation = validateMediaFile(newAttachment);
        if (validation.valid) {
          setAttachments((prev) => [...prev, newAttachment]);
          console.log('📷 Added image/video from gallery');
        } else {
          console.error('❌ Validation failed:', validation.error, newAttachment);
          Alert.alert('Invalid file', validation.error || 'File validation failed');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  // Handle document/file picker (not used in Messenger-style UI)
  // const handlePickDocument = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: ['audio/*', 'video/*', 'image/*'],
  //       multiple: true,
  //       copyToCacheDirectory: true,
  //     });
  //
  //     if (!result.canceled && result.assets) {
  //       const newAttachments: MediaFile[] = result.assets.map((asset) => ({
  //         uri: asset.uri,
  //         name: asset.name,
  //         type: 'file',
  //         size: asset.size || 0,
  //         mimeType: asset.mimeType,
  //       }));
  //
  //       // Validate each file
  //       const validAttachments: MediaFile[] = [];
  //       for (const attachment of newAttachments) {
  //         const validation = validateMediaFile(attachment);
  //         if (validation.valid) {
  //           validAttachments.push(attachment);
  //         } else {
  //           Alert.alert('Invalid file', validation.error || 'File validation failed');
  //         }
  //       }
  //
  //       if (validAttachments.length > 0) {
  //         setAttachments((prev) => [...prev, ...validAttachments]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error picking document:', error);
  //     Alert.alert('Error', 'Failed to pick file');
  //   }
  // };

  // Start audio recording
  const startRecording = async () => {
    try {
      console.log('🎙️ Starting audio recording...');

      // Check if app is in foreground
      const appState = AppState.currentState;
      if (appState !== 'active') {
        Alert.alert(
          'App must be active',
          'Please ensure the app is in the foreground to start recording.'
        );
        return;
      }

      // Check if audio recording is supported
      const isSupported = await AudioRecorder.isSupported();
      if (!isSupported) {
        Alert.alert('Permission required', 'Please grant permission to access your microphone');
        return;
      }

      // Create new audio recorder
      const audioRecorder = new AudioRecorder({
        onStop: (audioFile) => {
          console.log('🎵 Audio file created:', {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
          });

          // Check if recording is too short (less than 1 second)
          if (recordingTime < 1) {
            console.log('Recording too short, discarding...');
            resetRecordingState();
            return;
          }

          // Add audio file to attachments
          setAttachments((prev) => [...prev, audioFile]);

          // Reset state
          resetRecordingState();
        },
        onError: (error: Error) => {
          console.error('Recording error:', error);
          Alert.alert('Recording Error', error.message);
          resetRecordingState();
        },
      });

      audioRecorderRef.current = audioRecorder;

      // Start recording
      await audioRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        Alert.alert('Recording Error', error.message);
      }
      resetRecordingState();
    }
  };

  // Stop recording and save
  const stopRecording = async () => {
    if (audioRecorderRef.current) {
      await audioRecorderRef.current.stop();
    }
  };

  // Cancel recording without saving
  const cancelRecording = async () => {
    if (audioRecorderRef.current) {
      await audioRecorderRef.current.cancel();
    }
    resetRecordingState();
  };


  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || attachments.length > 0) && !isSending && !disabled && !isRecording;

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
      )
      }

      {/* Attachment Preview */}
      {
        attachments.length > 0 && (
          <AttachmentPreview attachments={attachments} onRemove={handleRemoveAttachment} />
        )
      }

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: theme.spacing.gap.md,
          paddingTop: theme.spacing.gap.md,
          gap: theme.spacing.gap.sm,
        }}
      >
        {/* Attachment buttons - Camera, Photo, Microphone (like Messenger) */}
        {!isRecording && !message.trim() && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.gap.sm,
            }}
          >
            {/* Camera button */}
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={disabled || isSending}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.secondary,
              }}
            >
              <Icon
                name="camera"
                size={20}
                color={disabled || isSending ? theme.colors.text.disabled : theme.colors.text.muted}
              />
            </TouchableOpacity>

            {/* Photo/Gallery button */}
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={disabled || isSending}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.secondary,
              }}
            >
              <Icon
                name="image"
                size={20}
                color={disabled || isSending ? theme.colors.text.disabled : theme.colors.text.muted}
              />
            </TouchableOpacity>

            {/* Microphone/Audio recording button */}
            <TouchableOpacity
              onPress={startRecording}
              disabled={disabled || isSending}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background.secondary,
              }}
            >
              <Icon
                name="microphone"
                size={20}
                color={disabled || isSending ? theme.colors.text.disabled : theme.colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Message input */}
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

        {/* Send button or Recording controls */}
        {
          isRecording ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.gap.sm,
              }}
            >
              {/* Cancel button */}
              <TouchableOpacity
                onPress={cancelRecording}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#ef4444',
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>

              {/* Recording indicator and timer */}
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

              {/* Stop/Send button */}
              <TouchableOpacity
                onPress={stopRecording}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.primary || '#007AFF',
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: 'white',
                  }}
                >
                  →
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSend}
              disabled={!canSend}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: theme.spacing.gap.xs,
                backgroundColor: canSend ? theme.colors.primary : theme.colors.background.secondary,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: canSend ? 'white' : theme.colors.text.secondary,
                }}
              >
                →
              </Text>
            </TouchableOpacity>
          )
        }
      </View >
    </View >
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
