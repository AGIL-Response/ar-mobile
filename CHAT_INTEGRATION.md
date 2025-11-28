# Chat Integration for AR Mobile

This document describes the chat module integration for ar-mobile using WatermelonDB and Observable patterns.

## Overview

The chat integration provides:
- Real-time messaging via WebSocket (Socket.IO)
- Offline-first architecture with WatermelonDB
- Reactive UI updates using Observable patterns
- Message persistence
- Room/conversation management

## Installation

### 1. Install Dependencies

```bash
cd ar-mobile
pnpm add @nozbe/watermelondb @nozbe/with-observables rxjs
```

### 2. Install Native Dependencies

For iOS:
```bash
cd ios && pod install && cd ..
```

Android dependencies are automatically linked.

## Project Structure

```
src/
├── services/
│   └── chat/
│       ├── database/              # WatermelonDB schema and models
│       │   ├── schema.ts
│       │   ├── models/
│       │   │   ├── Room.ts
│       │   │   ├── Message.ts
│       │   │   ├── Attachment.ts
│       │   │   └── RoomMember.ts
│       │   └── index.ts
│       ├── api-client.ts          # REST API client
│       ├── socket-service.ts      # WebSocket service
│       ├── db-service.ts          # WatermelonDB service with Observables
│       ├── chat-service.ts        # Main orchestration service
│       ├── types.ts               # TypeScript types
│       └── index.ts               # Public exports
│
└── screens/
    └── chat/
        ├── index.tsx              # Main chat screen (rooms list)
        ├── rooms-list.tsx          # Rooms list component
        ├── room.tsx                # Individual room screen
        └── components/
            ├── room-card.tsx       # Room card component
            ├── message.tsx         # Message component
            ├── composer.tsx        # Message composer
            └── chat-header.tsx     # Chat header
```

## Usage

### Initialize Chat Service

The chat service should be initialized when the user logs in:

```typescript
import { chatService } from '@/services/chat';

// Initialize (connects socket, syncs rooms)
await chatService.initialize();
```

### Using Observables in Components

```typescript
import { useObservable } from '@/lib/hooks/use-observable';
import { chatService } from '@/services/chat';

function RoomsList() {
  // Observe rooms - automatically updates when data changes
  const rooms = useObservable(chatService.observeRooms(), []);
  
  return (
    <FlatList
      data={rooms}
      renderItem={({ item }) => <RoomCard room={item} />}
    />
  );
}
```

### Sending Messages

```typescript
await chatService.sendMessage({
  roomId: 'room-id',
  content: 'Hello!',
  type: 'text',
});
```

## Key Features

### 1. WatermelonDB Integration
- Local SQLite database for offline access
- Automatic synchronization with backend
- Observable queries for reactive updates

### 2. Socket.IO Integration
- Real-time message delivery
- Automatic reconnection
- Typing indicators
- Presence updates

### 3. Observable Patterns
- Reactive UI updates
- Automatic data synchronization
- Efficient rendering

## Configuration

Update your environment variables or app config:

```typescript
// In app.config.ts or .env
CHAT_API_URL=https://dev.agilres.net/chat
CHAT_SOCKET_URL=https://dev.agilres.net/chat
```

The chat service uses these URLs to connect to the backend API and WebSocket server.

## API Endpoints

The chat API client expects the following endpoints:
- `GET /chat/conversations` - Get all rooms
- `GET /chat/conversations/:id` - Get single room
- `POST /chat/conversations` - Create room
- `GET /chat/conversations/:id/messages` - Get messages
- `POST /chat/messages` - Send message
- `PUT /chat/messages/:id` - Edit message
- `DELETE /chat/messages/:id` - Delete message

## Socket Events

The socket service handles these events:
- `message:new` - New message received
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `conversation:updated` - Room updated
- `typing:start` - User started typing
- `presence:update` - User presence changed

## Best Practices

1. **Always initialize chat service after authentication**
   - Ensures proper token handling
   - Connects socket with valid credentials

2. **Use Observables for reactive updates**
   - Don't manually refresh data
   - Let Observables handle updates automatically

3. **Handle offline scenarios**
   - WatermelonDB stores data locally
   - Messages sync when connection is restored

4. **Clean up on unmount**
   - Disconnect socket when leaving chat screens
   - Clean up subscriptions

## Troubleshooting

### Database not initializing
- Ensure WatermelonDB dependencies are installed
- Check iOS pod installation
- Verify database schema is correct

### Socket not connecting
- Check authentication token
- Verify socket URL configuration
- Check network connectivity

### Messages not syncing
- Verify API endpoints are correct
- Check authentication headers
- Review socket event handlers

## Next Steps

1. Install dependencies: `pnpm add @nozbe/watermelondb @nozbe/with-observables rxjs`
2. Run iOS pod install: `cd ios && pod install`
3. Configure chat API URLs in environment
4. Initialize chat service after user login
5. Test chat functionality

## Notes

- The chat service automatically handles reconnection
- Messages are stored locally for offline access
- Observable patterns ensure UI stays in sync with data
- All components follow the existing ar-mobile component patterns

