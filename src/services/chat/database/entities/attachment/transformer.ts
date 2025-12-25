import type Attachment from '../../models/Attachment';
import type { ChatAttachment } from '../../../types';

/**
 * Convert ChatAttachment to WatermelonDB Attachment model data
 */
export function chatAttachmentToAttachmentData(attachmentData: ChatAttachment, messageId: string): {
  attachmentId: string;
  messageId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  localPath?: string;
  thumbnail?: string;
  duration?: string;
} {
  const attachmentId = typeof attachmentData.id === 'string' ? attachmentData.id : String(attachmentData.id);
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  // Check if url is a local file URI (file:// or starts with /)
  const isLocalPath = attachmentData.url.startsWith('file://') || attachmentData.url.startsWith('/');

  return {
    attachmentId,
    messageId: validMessageId,
    filename: attachmentData.filename,
    url: isLocalPath ? '' : attachmentData.url, // Use empty string for local paths, will be updated from server
    size: attachmentData.size,
    mimeType: attachmentData.mimeType,
    uploadedAt: attachmentData.uploadedAt,
    localPath: isLocalPath ? attachmentData.url : undefined, // Store local path if it's a local file
    thumbnail: attachmentData.thumbnail,
    duration: attachmentData.duration,
  };
}

/**
 * Convert WatermelonDB Attachment to ChatAttachment
 */
export function attachmentToChatAttachment(attachment: Attachment): ChatAttachment {
  // Use localPath if url is empty (file hasn't been uploaded to server yet)
  const url = attachment.url || attachment.localPath || '';
  
  return {
    id: attachment.attachmentId,
    filename: attachment.filename,
    url,
    size: attachment.size,
    mimeType: attachment.mimeType,
    uploadedAt: attachment.uploadedAt,
    thumbnail: attachment.thumbnail,
    duration: attachment.duration,
  };
}

