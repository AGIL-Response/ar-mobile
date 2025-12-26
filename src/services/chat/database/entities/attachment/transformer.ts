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

  // Prioritize explicit localPath from attachmentData first
  // Then check if url is a local file URI (file://, content://, or starts with /)
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
  if (isLocalPath || attachmentData.localPath) {
    console.log('[AttachmentTransformer] Processing attachment:', {
      url: url.substring(0, 50) + '...',
      localPath: attachmentData.localPath?.substring(0, 50) + '...',
      filename: attachmentData.filename,
      messageId: validMessageId,
      isLocalPath,
      hasExplicitLocalPath: !!attachmentData.localPath,
    });
  }

  // Prioritize explicit localPath from attachmentData, then detect from URL
  // If localPath is explicitly provided, use it (even if url is also set)
  const finalLocalPath = attachmentData.localPath || (isLocalPath ? attachmentData.url : undefined);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'attachment/transformer.ts:48',message:'chatAttachmentToAttachmentData - INPUT',data:{attachmentId,messageId:validMessageId,filename:attachmentData.filename,inputUrl:attachmentData.url?.substring(0,50),inputLocalPath:attachmentData.localPath?.substring(0,50),hasInputUrl:!!attachmentData.url,hasInputLocalPath:!!attachmentData.localPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const result = {
    attachmentId,
    messageId: validMessageId,
    filename: attachmentData.filename,
    url: isLocalPath ? '' : attachmentData.url, // Use empty string for local paths, will be updated from server
    size: attachmentData.size,
    mimeType: attachmentData.mimeType,
    uploadedAt: attachmentData.uploadedAt,
    localPath: finalLocalPath, // Store local path if it's a local file or explicitly provided
    thumbnail: attachmentData.thumbnail,
    duration: attachmentData.duration,
  };

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'attachment/transformer.ts:62',message:'chatAttachmentToAttachmentData - OUTPUT',data:{attachmentId,messageId:validMessageId,filename:attachmentData.filename,outputUrl:result.url?.substring(0,50),outputLocalPath:result.localPath?.substring(0,50),hasOutputUrl:!!result.url,hasOutputLocalPath:!!result.localPath,isLocalPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return result;
}

/**
 * Convert WatermelonDB Attachment to ChatAttachment
 */
export function attachmentToChatAttachment(attachment: Attachment): ChatAttachment {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'attachment/transformer.ts:67',message:'attachmentToChatAttachment - INPUT',data:{attachmentId:attachment.attachmentId,filename:attachment.filename,dbUrl:attachment.url?.substring(0,50),dbLocalPath:attachment.localPath?.substring(0,50),hasDbUrl:!!attachment.url,hasDbLocalPath:!!attachment.localPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

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
  
  const result = {
    id: attachment.attachmentId,
    filename: attachment.filename,
    url,
    size: attachment.size,
    mimeType: attachment.mimeType,
    uploadedAt: attachment.uploadedAt,
    thumbnail: attachment.thumbnail,
    duration: attachment.duration,
  };

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'attachment/transformer.ts:104',message:'attachmentToChatAttachment - OUTPUT',data:{attachmentId:attachment.attachmentId,filename:attachment.filename,outputUrl:result.url?.substring(0,50),hasOutputUrl:!!result.url,outputUrlLength:result.url?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  return result;
}

