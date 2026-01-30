/**
 * Message Size Estimator
 * Estimates message item heights for better FlatList performance
 * Single Responsibility: Calculate estimated heights for different message types
 */

import type { ChatAttachment, ChatMessage } from '@/services/chat';
import { getMediaType } from '@/utils/media';

// Base heights for different message components
const BASE_MESSAGE_HEIGHT = 40; // Base padding and bubble
const TEXT_LINE_HEIGHT = 20; // Line height for text
const TEXT_PADDING = 16; // Horizontal padding
const AVATAR_HEIGHT = 32; // Small avatar size
const AVATAR_MARGIN = 8; // Margin between avatar and message
const SENDER_NAME_HEIGHT = 20; // Sender name height
const SENDER_NAME_MARGIN = 4; // Margin below sender name
const DATE_SEPARATOR_HEIGHT = 48; // Date separator height (16px margin top + 16px margin bottom + ~16px content)
const COMPACT_MARGIN = 4; // Margin for compact messages
const NORMAL_MARGIN = 12; // Margin for normal messages

// Attachment heights
const IMAGE_ATTACHMENT_HEIGHT = 250; // Estimated image height (based on MAX_ATTACHMENT_WIDTH * 0.75 aspect ratio)
const VIDEO_ATTACHMENT_HEIGHT = 250; // Estimated video height (similar to images)
const AUDIO_ATTACHMENT_HEIGHT = 60; // Audio player height
const FILE_ATTACHMENT_HEIGHT = 60; // File attachment height

// Additional heights
const REPLY_PREVIEW_HEIGHT = 40; // Reply preview height
const EDITED_TEXT_HEIGHT = 15; // Edited text height
const ERROR_ACTIONS_HEIGHT = 32; // Error retry/delete actions height
const TIMESTAMP_HEIGHT = 14; // Timestamp height

/**
 * Estimate text height based on content length
 */
function estimateTextHeight(text: string, maxWidth: number = 250): number {
  if (!text || text.length === 0) return 0;
  
  // Rough estimation: average character width ~8px, line height 20px
  // Account for word wrapping
  const avgCharsPerLine = Math.floor(maxWidth / 8);
  const lines = Math.ceil(text.length / avgCharsPerLine);
  return Math.max(1, lines) * TEXT_LINE_HEIGHT;
}

/**
 * Estimate attachment height based on attachment type
 */
function estimateAttachmentHeight(attachment: ChatAttachment): number {
  if (!attachment) return 0;
  
  const mediaType = getMediaType(attachment.filename, attachment.mimeType);
  
  switch (mediaType) {
    case 'image':
      return IMAGE_ATTACHMENT_HEIGHT;
    case 'video':
      return VIDEO_ATTACHMENT_HEIGHT;
    case 'audio':
      return AUDIO_ATTACHMENT_HEIGHT;
    case 'file':
    default:
      return FILE_ATTACHMENT_HEIGHT;
  }
}

/**
 * Estimate message item height for FlatList
 * This helps with better scroll performance by providing accurate size estimates
 */
export function estimateMessageHeight(
  message: ChatMessage,
  options: {
    showAvatar?: boolean;
    showSenderName?: boolean;
    compact?: boolean;
    showDateSeparator?: boolean;
    previousMessage?: ChatMessage | null;
  } = {}
): number {
  const {
    showAvatar = false,
    showSenderName = false,
    compact = false,
    showDateSeparator = false,
  } = options;

  let height = 0;

  // Date separator height
  if (showDateSeparator) {
    height += DATE_SEPARATOR_HEIGHT;
  }

  // Message row height
  const marginBottom = compact ? COMPACT_MARGIN : NORMAL_MARGIN;
  height += marginBottom;

  // Avatar height (if shown)
  if (showAvatar) {
    height += Math.max(AVATAR_HEIGHT, BASE_MESSAGE_HEIGHT);
  } else {
    height += BASE_MESSAGE_HEIGHT;
  }

  // Sender name (if shown)
  if (showSenderName) {
    height += SENDER_NAME_HEIGHT + SENDER_NAME_MARGIN;
  }

  // Reply preview
  if (message.replyTo) {
    height += REPLY_PREVIEW_HEIGHT;
  }

  // Attachments
  if (message.attachments && message.attachments.length > 0) {
    // Sum up all attachment heights
    const attachmentHeight = message.attachments.reduce((sum, att) => {
      return sum + estimateAttachmentHeight(att);
    }, 0);
    height += attachmentHeight;
  }

  // Text content
  if (message.content) {
    const textHeight = estimateTextHeight(message.content);
    height += textHeight;
  }

  // Edited text
  if (message.editedAt) {
    height += EDITED_TEXT_HEIGHT;
  }

  // Error actions (retry/delete buttons)
  if (message.status === 'error') {
    height += ERROR_ACTIONS_HEIGHT;
  }

  // Timestamp (always shown, minimal height)
  height += TIMESTAMP_HEIGHT;

  // Add some padding for safety
  height += 8;

  return Math.max(60, height); // Minimum height of 60px
}

/**
 * Get estimated item size for a message
 * Used by FlatList for better scroll performance
 */
export function getEstimatedItemSize(message: ChatMessage): number {
  // Quick estimation without full context
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasText = message.content && message.content.length > 0;
  
  if (hasAttachments) {
    const firstAttachment = message.attachments?.[0];
    if (!firstAttachment) return 0;
    const mediaType = getMediaType(firstAttachment.filename, firstAttachment.mimeType);
    
    if (mediaType === 'image' || mediaType === 'video') {
      return 280; // Images and videos are taller
    } else if (mediaType === 'audio') {
      return 100; // Audio is medium height
    } else {
      return 90; // Files are shorter
    }
  }
  
  if (hasText) {
    // Estimate based on text length
    const textLength = message.content.length;
    if (textLength < 50) {
      return 70; // Short text
    } else if (textLength < 150) {
      return 90; // Medium text
    } else {
      return 120; // Long text (will wrap)
    }
  }
  
  return 75; // Default fallback
}

/**
 * Calculate average estimated size for a batch of messages
 * Useful for setting initial estimatedItemSize
 */
export function getAverageEstimatedSize(messages: ChatMessage[]): number {
  if (messages.length === 0) return 75;
  
  const total = messages.reduce((sum, msg) => {
    return sum + getEstimatedItemSize(msg);
  }, 0);
  
  return Math.round(total / messages.length);
}

