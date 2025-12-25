# Message Attachment Implementation

This document describes the message attachment feature implementation for ar-mobile, similar to ar-web.

## Overview

The attachment feature allows users to:
- Send images, videos, and audio files with messages
- Preview attachments before sending
- View attachments in messages (images, videos, audio, files)
- Full-screen media viewer for images and videos
- Support for multiple attachments per message

## Files Added/Modified

### New Files

1. **`src/utils/media.ts`**
   - Media utility functions
   - File type detection (image/video/audio)
   - File validation and size checking
   - MIME type detection
   - File size formatting

2. **`src/screens/chat/components/attachment-preview.tsx`**
   - Shows preview of selected attachments before sending
   - Horizontal scroll list of thumbnails
   - Remove button for each attachment
   - File size display

3. **`src/screens/chat/components/message-attachment.tsx`**
   - Displays attachments within messages
   - Different layouts for images, videos, audio, and files
   - Thumbnail generation for images/videos
   - Play button overlay for videos
   - File metadata display

4. **`src/screens/chat/components/media-viewer.tsx`**
   - Full-screen modal viewer for media
   - Navigation between multiple attachments
   - Close button
   - Support for images, videos, and audio playback

### Modified Files

1. **`src/screens/chat/components/composer.tsx`**
   - Added attachment picker UI (image and document buttons)
   - Integration with `expo-image-picker` for photos/videos
   - Integration with `expo-document-picker` for files
   - Attachment preview display
   - File validation before adding
   - Updated send logic to include attachments
   - Determines message type based on attachment

2. **`src/screens/chat/components/message.tsx`**
   - Added `MessageAttachment` component integration
   - Updated message bubble styling for attachments
   - Added `onAttachmentPress` prop
   - Adjusted padding based on attachment presence

3. **`src/screens/chat/room.tsx`**
   - Added media viewer state management
   - Added attachment press handler
   - Integrated `MediaViewer` component
   - Pass attachment press handler to messages

4. **`src/screens/chat/components/index.ts`**
   - Export new components

## Dependencies Used

The implementation uses existing dependencies already in `package.json`:

- `expo-image-picker` - For selecting images/videos from library
- `expo-document-picker` - For selecting documents/files
- `expo-image` - For image display with optimization
- `expo-video` - For video playback
- `expo-file-system` - For file operations

## Features

### Attachment Types Supported

1. **Images**: jpg, jpeg, png, gif, webp
2. **Videos**: mp4, mov, avi, webm, mkv, flv, wmv
3. **Audio**: mp3, wav, ogg, m4a, aac, flac

### File Validation

- Maximum file size: 100MB
- File type validation
- Multiple file selection support
- Error alerts for invalid files

### UI/UX Features

1. **Composer**
   - Image button (opens photo/video picker)
   - Paperclip button (opens document picker)
   - Horizontal scrollable attachment preview
   - Remove individual attachments before sending
   - Send button enabled when message or attachments present

2. **Message Display**
   - Images: Full preview with filename overlay
   - Videos: Thumbnail with play button overlay
   - Audio: File icon with play button
   - Files: File icon with download indicator
   - File size displayed for all types

3. **Media Viewer**
   - Full-screen modal
   - Swipe/navigate between multiple attachments
   - Close button
   - Filename and counter display
   - Native video controls
   - Works with images, videos, and audio

## API Integration

The attachment feature integrates with the existing chat API:

```typescript
// Send message with attachments
await chatService.sendMessage({
  roomId: 'room-id',
  content: 'Message text',
  type: 'image', // or 'file' based on attachment type
  attachments: [/* File objects */],
});
```

The API client (`src/services/chat/api-client.ts`) already has support for:
- FormData submission with attachments
- Multiple file uploads
- Attachment metadata in message response

## Database Schema

The existing WatermelonDB schema already supports attachments:

- `attachments` table with fields:
  - `attachment_id`
  - `message_id`
  - `filename`
  - `url`
  - `size`
  - `mime_type`
  - `uploaded_at`
  - `local_path`

## Usage Example

```typescript
// In a chat room
<Composer
  onSend={handleSend}
  onTyping={handleTyping}
  replyTo={replyTo}
  onCancelReply={handleCancelReply}
/>

// Messages with attachments
<Message
  message={message}
  onAttachmentPress={(attachment, index) => {
    // Open media viewer
  }}
/>

// Media viewer
<MediaViewer
  visible={visible}
  attachments={attachments}
  initialIndex={0}
  onClose={handleClose}
/>
```

## Testing

To test the implementation:

1. Open a chat room
2. Click the image button to select photos/videos
3. Click the paperclip button to select files
4. Preview attachments before sending
5. Send message with attachments
6. Tap on attachments in messages to view full-screen
7. Navigate between multiple attachments in viewer
8. Test with different file types (images, videos, audio)

## Notes

- The implementation follows the same patterns as ar-web
- Uses single quotes as per user preference
- All files validate before sending
- Graceful error handling with user alerts
- Optimized for React Native performance
- Uses expo native modules for best compatibility

