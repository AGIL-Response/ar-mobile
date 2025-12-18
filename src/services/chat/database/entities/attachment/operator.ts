import { getDatabase } from '../../index';
import type Attachment from '../../models/Attachment';
import type { ChatAttachment } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { chatAttachmentToAttachmentData, attachmentToChatAttachment } from './transformer';

const db = getDatabase();

/**
 * Upsert attachments for a message
 */
export async function upsertAttachments(messageId: string, attachments: ChatAttachment[]): Promise<void> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  // Deduplicate attachments by ID (keep first occurrence of each unique ID)
  const uniqueAttachments = attachments.reduce((acc, current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as ChatAttachment[]);

  if (uniqueAttachments.length !== attachments.length) {
    console.warn('⚠️ [AttachmentOperator] Duplicate attachments detected:', {
      original: attachments.length,
      unique: uniqueAttachments.length,
      duplicates: attachments.length - uniqueAttachments.length,
    });
  }

  // Get existing attachments for this message
  const existingAttachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  // Check if attachments have changed (compare IDs only for efficiency)
  const existingIds = new Set(existingAttachments.map(a => a.attachmentId));
  const newIds = new Set(uniqueAttachments.map(a => a.id));

  const hasChanged =
    existingIds.size !== newIds.size ||
    ![...existingIds].every(id => newIds.has(id));

  if (!hasChanged) {
    return;
  }

  // Preserve localPath from existing attachments before deleting
  const localPathMap = new Map<string, string>();
  for (const existingAttachment of existingAttachments) {
    if (existingAttachment.localPath) {
      localPathMap.set(existingAttachment.attachmentId, existingAttachment.localPath);
    }
  }

  await db.write(async () => {
    for (const attachment of existingAttachments) {
      await attachment.destroyPermanently();
    }

    for (const attachmentData of uniqueAttachments) {
      const attachmentDataTransformed = chatAttachmentToAttachmentData(attachmentData, validMessageId);
      
      // Preserve localPath from existing attachment if it exists
      const preservedLocalPath = localPathMap.get(attachmentDataTransformed.attachmentId) || attachmentDataTransformed.localPath;
      
      await db.get<Attachment>('attachments').create((attachment) => {
        attachment.attachmentId = attachmentDataTransformed.attachmentId;
        attachment.messageId = attachmentDataTransformed.messageId;
        attachment.filename = attachmentDataTransformed.filename;
        attachment.url = attachmentDataTransformed.url;
        attachment.size = attachmentDataTransformed.size;
        attachment.mimeType = attachmentDataTransformed.mimeType;
        attachment.uploadedAt = attachmentDataTransformed.uploadedAt;
        if (preservedLocalPath) {
          attachment.localPath = preservedLocalPath;
        }
      });
    }
  });

}

/**
 * Get attachments for a message
 */
export async function getAttachments(messageId: string): Promise<ChatAttachment[]> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  const attachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  // Deduplicate by attachment_id (keep first occurrence of each unique ID)
  const uniqueAttachments = attachments.reduce((acc, current) => {
    const exists = acc.find(item => item.attachmentId === current.attachmentId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as Attachment[]);

  if (uniqueAttachments.length !== attachments.length) {
    console.warn('⚠️ [AttachmentOperator] Duplicate attachments found in DB:', {
      messageId: validMessageId,
      original: attachments.length,
      unique: uniqueAttachments.length,
      duplicates: attachments.length - uniqueAttachments.length,
    });
  }

  return uniqueAttachments.map(attachmentToChatAttachment);
}

