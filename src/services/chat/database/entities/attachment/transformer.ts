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
} {
  const attachmentId = typeof attachmentData.id === 'string' ? attachmentData.id : String(attachmentData.id);
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  return {
    attachmentId,
    messageId: validMessageId,
    filename: attachmentData.filename,
    url: attachmentData.url,
    size: attachmentData.size,
    mimeType: attachmentData.mimeType,
    uploadedAt: attachmentData.uploadedAt,
    localPath: undefined, // Can be set later if needed
  };
}

/**
 * Convert WatermelonDB Attachment to ChatAttachment
 */
export function attachmentToChatAttachment(attachment: Attachment): ChatAttachment {
  return {
    id: attachment.attachmentId,
    filename: attachment.filename,
    url: attachment.url,
    size: attachment.size,
    mimeType: attachment.mimeType,
    uploadedAt: attachment.uploadedAt,
  };
}

