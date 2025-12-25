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

  // Check if url is a local file URI (file://, content://, or starts with /)
  // React Native file URIs can be: file://, content:// (Android), or absolute paths
  const url = attachmentData.url || '';
  const isLocalPath = 
    url.length > 0 && (
      url.startsWith('file://') || 
      url.startsWith('content://') || 
      url.startsWith('/') ||
      (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:'))
    );

  // Debug logging to help diagnose issues
  if (isLocalPath) {
    console.log('[AttachmentTransformer] Detected local path:', {
      url: url.substring(0, 50) + '...',
      filename: attachmentData.filename,
      messageId: validMessageId,
    });
  }

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
  // Empty string is falsy, so we need to check explicitly
  const url = (attachment.url && attachment.url.trim() !== '') 
    ? attachment.url 
    : (attachment.localPath || '');
  
  // Debug logging
  if (!attachment.url || attachment.url.trim() === '') {
    if (attachment.localPath) {
      console.log('[AttachmentTransformer] Using localPath for attachment:', {
        attachmentId: attachment.attachmentId,
        filename: attachment.filename,
        localPath: attachment.localPath.substring(0, 50) + '...',
        hasUrl: !!attachment.url,
        hasLocalPath: !!attachment.localPath,
      });
    } else {
      console.warn('[AttachmentTransformer] No URL or localPath for attachment:', {
        attachmentId: attachment.attachmentId,
        filename: attachment.filename,
        url: attachment.url,
        localPath: attachment.localPath,
      });
    }
  }
  
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

