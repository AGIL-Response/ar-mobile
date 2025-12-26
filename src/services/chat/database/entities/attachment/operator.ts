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
    // Create a map of existing attachments by attachmentId for efficient lookup
    const existingAttachmentsMap = new Map<string, Attachment>();
    for (const attachment of existingAttachments) {
      const existing = existingAttachmentsMap.get(attachment.attachmentId);
      // If duplicate exists, keep the first one and mark others for deletion
      if (!existing) {
        existingAttachmentsMap.set(attachment.attachmentId, attachment);
      } else {
        // Delete duplicate attachments immediately
        await attachment.destroyPermanently();
      }
    }

    // Process each attachment: update existing or create new
    for (const attachmentData of uniqueAttachments) {
      const attachmentDataTransformed = chatAttachmentToAttachmentData(attachmentData, validMessageId);
      
      // Preserve localPath from existing attachment if it exists
      const preservedLocalPath = localPathMap.get(attachmentDataTransformed.attachmentId) || attachmentDataTransformed.localPath;
      
      const existingAttachment = existingAttachmentsMap.get(attachmentDataTransformed.attachmentId);
      
      if (existingAttachment) {
        // Update existing attachment instead of creating new one
        await existingAttachment.update((attachment) => {
          attachment.attachmentId = attachmentDataTransformed.attachmentId;
          attachment.messageId = attachmentDataTransformed.messageId;
          attachment.filename = attachmentDataTransformed.filename;
          attachment.url = attachmentDataTransformed.url;
          attachment.size = attachmentDataTransformed.size;
          attachment.mimeType = attachmentDataTransformed.mimeType;
          attachment.uploadedAt = attachmentDataTransformed.uploadedAt;
          // Always set localPath if it exists (from preserved or from transformed data)
          if (preservedLocalPath || attachmentDataTransformed.localPath) {
            attachment.localPath = preservedLocalPath || attachmentDataTransformed.localPath;
          }
          if (attachmentDataTransformed.thumbnail) {
            attachment.thumbnail = attachmentDataTransformed.thumbnail;
          }
          if (attachmentDataTransformed.duration) {
            attachment.duration = attachmentDataTransformed.duration;
          }
        });
        // Remove from map so we know it's been processed
        existingAttachmentsMap.delete(attachmentDataTransformed.attachmentId);
      } else {
        // Create new attachment
        await db.get<Attachment>('attachments').create((attachment) => {
          attachment.attachmentId = attachmentDataTransformed.attachmentId;
          attachment.messageId = attachmentDataTransformed.messageId;
          attachment.filename = attachmentDataTransformed.filename;
          attachment.url = attachmentDataTransformed.url;
          attachment.size = attachmentDataTransformed.size;
          attachment.mimeType = attachmentDataTransformed.mimeType;
          attachment.uploadedAt = attachmentDataTransformed.uploadedAt;
          // Always set localPath if it exists (from preserved or from transformed data)
          if (preservedLocalPath || attachmentDataTransformed.localPath) {
            attachment.localPath = preservedLocalPath || attachmentDataTransformed.localPath;
          }
          if (attachmentDataTransformed.thumbnail) {
            attachment.thumbnail = attachmentDataTransformed.thumbnail;
          }
          if (attachmentDataTransformed.duration) {
            attachment.duration = attachmentDataTransformed.duration;
          }
        });
      }
    }

    // Delete any remaining attachments that weren't in the new list
    for (const remainingAttachment of existingAttachmentsMap.values()) {
      await remainingAttachment.destroyPermanently();
    }
  });

}

/**
 * Clean up duplicate attachments for a message
 * Keeps the first occurrence of each unique attachmentId
 */
async function cleanupDuplicateAttachments(messageId: string): Promise<void> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  const attachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  if (attachments.length <= 1) {
    return; // No duplicates possible
  }

  // Group attachments by attachmentId
  const attachmentsById = new Map<string, Attachment[]>();
  for (const attachment of attachments) {
    const existing = attachmentsById.get(attachment.attachmentId) || [];
    existing.push(attachment);
    attachmentsById.set(attachment.attachmentId, existing);
  }

  // Find duplicates (attachmentIds with more than one attachment)
  const duplicates: Attachment[] = [];
  for (const [attachmentId, attachmentList] of attachmentsById.entries()) {
    if (attachmentList.length > 1) {
      // Keep the first one, mark the rest as duplicates
      duplicates.push(...attachmentList.slice(1));
    }
  }

  if (duplicates.length > 0) {
    await db.write(async () => {
      for (const duplicate of duplicates) {
        await duplicate.destroyPermanently();
      }
    });
  }
}

/**
 * Get attachments for a message
 */
export async function getAttachments(messageId: string): Promise<ChatAttachment[]> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);

  // Clean up duplicates before fetching
  await cleanupDuplicateAttachments(validMessageId);

  const attachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  // Deduplicate by attachment_id (keep first occurrence of each unique ID)
  // This is a safety net in case cleanup didn't catch everything
  const uniqueAttachments = attachments.reduce((acc, current) => {
    const exists = acc.find(item => item.attachmentId === current.attachmentId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as Attachment[]);

  if (uniqueAttachments.length !== attachments.length) {
    console.warn('⚠️ [AttachmentOperator] Duplicate attachments found in DB (after cleanup):', {
      messageId: validMessageId,
      original: attachments.length,
      unique: uniqueAttachments.length,
      duplicates: attachments.length - uniqueAttachments.length,
    });
  }

  return uniqueAttachments.map(attachmentToChatAttachment);
}

