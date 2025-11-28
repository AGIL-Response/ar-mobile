# Chat Service Integration

This directory contains the complete chat integration for ar-mobile using WatermelonDB and Observable patterns.

## Installation

First, install the required dependencies:

```bash
cd ar-mobile
pnpm add @nozbe/watermelondb @nozbe/with-observables rxjs
```

For React Native, you also need to install the SQLite adapter:

```bash
# iOS
cd ios && pod install && cd ..

# Android - no additional steps needed, it's included
```

## Structure

```
services/chat/
├── database/
│   ├── schema.ts          # WatermelonDB schema definition
│   ├── models/            # Database models (Room, Message, Attachment, RoomMember)
│   └── index.ts           # Database initialization
├── api-client.ts          # REST API client for chat endpoints
├── socket-service.ts      # WebSocket service for real-time communication
├── db-service.ts         # WatermelonDB service with Observable patterns
├── chat-service.ts        # Main chat service orchestrating all components
├── types.ts               # TypeScript types
└── index.ts               # Public exports
```

## Usage

### Initialize Chat Service

```typescript
import { chatService } from '@/services/chat';

// Initialize chat (connects socket, syncs rooms)
await chatService.initialize();
```

### Observe Rooms

```typescript
import { useObservable } from '@/lib/hooks/use-observable';
import { chatService } from '@/services/chat';

function RoomsList() {
  const rooms = useObservable(chatService.observeRooms(), []);
  
  return (
    // Render rooms
  );
}
```

### Observe Messages

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const messages = useObservable(
    chatService.observeMessages(roomId, 50),
    []
  );
  
  return (
    // Render messages
  );
}
```

### Send Message

```typescript
await chatService.sendMessage({
  roomId: 'room-id',
  content: 'Hello!',
  type: 'text',
});
```

## Components

Chat components are located in `screens/chat/components/`:
- `RoomCard` - Displays a room in the rooms list
- `Message` - Displays a single message
- `Composer` - Message input component

## Configuration

Update your environment variables or app config to set chat API URLs:

```typescript
// In app.config.ts or .env
CHAT_API_URL=https://dev.agilres.net/chat
CHAT_SOCKET_URL=https://dev.agilres.net/chat
```

## Features

- ✅ Real-time messaging via WebSocket
- ✅ Offline-first with WatermelonDB
- ✅ Observable patterns for reactive updates
- ✅ Message persistence
- ✅ Room management
- ✅ Typing indicators
- ✅ Read receipts
- ✅ File attachments support

## Notes

- The chat service automatically syncs with the backend API
- Messages are stored locally in WatermelonDB for offline access
- Observable patterns ensure UI updates automatically when data changes
- Socket service handles reconnection automatically

