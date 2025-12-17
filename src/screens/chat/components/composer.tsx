/**
 * Message Composer Component
 * Input component for sending chat messages with attachment support
 */

import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { Input, Icon, Text } from '@/components';
import { useTheme } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { SendMessageData } from '@/services/chat';
import type { MediaFile } from '@/utils/media';
import { validateMediaFile, getMediaType, getMimeType } from '@/utils/media';
import { AttachmentPreview } from './attachment-preview';

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: MediaFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `media_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
          type: asset.type || 'image',
          size: asset.fileSize || 0,
          mimeType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        }));

        // Validate each file
        const validAttachments: MediaFile[] = [];
        for (const attachment of newAttachments) {
          const validation = validateMediaFile(attachment);
          if (validation.valid) {
            validAttachments.push(attachment);
          } else {
            Alert.alert('Invalid file', validation.error || 'File validation failed');
          }
        }

        if (validAttachments.length > 0) {
          setAttachments((prev) => [...prev, ...validAttachments]);
          console.log('📷 Added images/videos:', validAttachments.length, 'attachments');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: MediaFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          type: 'file',
          size: asset.size || 0,
          mimeType: asset.mimeType,
        }));

        // Validate each file
        const validAttachments: MediaFile[] = [];
        for (const attachment of newAttachments) {
          const validation = validateMediaFile(attachment);
          if (validation.valid) {
            validAttachments.push(attachment);
          } else {
            Alert.alert('Invalid file', validation.error || 'File validation failed');
          }
        }

        if (validAttachments.length > 0) {
          setAttachments((prev) => [...prev, ...validAttachments]);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || attachments.length > 0) && !isSending && !disabled;

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
            <Text style={{ color: theme.colors.text.secondary, fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <AttachmentPreview attachments={attachments} onRemove={handleRemoveAttachment} />
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
        {/* Attachment buttons */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.gap.xs,
          }}
        >
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
              name="camera"
              size={20}
              color={disabled || isSending ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickDocument}
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
              name="upload"
              size={20}
              color={disabled || isSending ? theme.colors.text.disabled : theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Message input */}
        <View style={{ flex: 1 }}>
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

        {/* Send button */}
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
      </View>
    </View>
  );
}

