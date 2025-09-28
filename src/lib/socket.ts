import { io, type Socket } from 'socket.io-client';

export interface LocationCoordinates {
  longitude: number;
  latitude: number;
  altitude?: number;
}

export interface SocketLocationPayload {
  coordinates: [number, number, number]; // [longitude, latitude, altitude]
}

export interface SocketLocationUpdateEvent {
  event: string;
  properties: {
    entityId: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

/**
 * Initialize WebSocket connection to maps endpoint
 * @param accessToken - User's access token for authentication
 * @returns Socket.IO client instance
 */
export const initMapSocket = (accessToken: string): Socket => {
  const baseUrl = 'https://dev.agilres.net';

  return io(`${baseUrl}`, {
    path: '/be/ws',
    withCredentials: true,
    auth: {
      authorization: `Bearer ${accessToken}`,
    },
    transports: ['websocket', 'polling'],
  });
};

/**
 * Handle WebSocket events for location updates
 * @param socket - Socket.IO client instance
 * @param onLocationUpdate - Callback for handling location updates from other users
 */
export const handleListenMapSocket = (
  socket: Socket,
  onLocationUpdate?: (event: SocketLocationUpdateEvent) => void
) => {
  // Listen for location updates from other users
  socket.on('maps', (data: any) => {
    try {
      console.log('📩 Received socket data:', data);

      // Handle the data directly as an object (like web app)
      if (
        data &&
        typeof data === 'object' &&
        data.event === 'locations.updated'
      ) {
        console.log('📩 Processing location update:', data);
        onLocationUpdate?.(data as SocketLocationUpdateEvent);
      } else if (typeof data === 'string') {
        // Try to parse as JSON if it's a string
        const parsedData = JSON.parse(data) as SocketLocationUpdateEvent;
        if (parsedData.event === 'locations.updated') {
          console.log('📩 Processing parsed location update:', parsedData);
          onLocationUpdate?.(parsedData);
        }
      } else if (data && data.event === 'error') {
        console.error('❌ Socket error event:', data);
        // Handle authentication errors
        if (data.data?.error?.status === 401) {
          console.error(
            '🔐 Authentication failed - token may be invalid or expired'
          );
        }
      } else {
        console.log('📩 Received non-location data:', data);
      }
    } catch (error) {
      console.error('Error processing socket data:', error, 'Raw data:', data);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason: string) => {
    console.log('❌ WebSocket disconnected:', socket?.id, reason);
  });

  // Handle connection
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id);
    console.log('🔗 Socket transport:', socket.io.engine.transport.name);
  });

  // Handle transport upgrade
  socket.io.engine.on('upgrade', (transport) => {
    console.log('🚀 Transport upgraded to:', transport.name);
  });

  // Handle connection errors
  socket.on('connect_error', (error: Error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  // Handle any other events for debugging
  socket.onAny((eventName, ...args) => {
    if (eventName !== 'maps') {
      console.log('🔍 Socket event:', eventName, args);
    }
  });
};

/**
 * Send location coordinates to WebSocket
 * @param socket - Socket.IO client instance
 * @param coordinates - Location coordinates to send
 */
export const sendLocationToSocket = (
  socket: Socket,
  coordinates: LocationCoordinates
): void => {
  if (!socket.connected) {
    console.warn('⚠️ WebSocket not connected, cannot send location');
    return;
  }

  const payload: SocketLocationPayload = {
    coordinates: [
      coordinates.longitude,
      coordinates.latitude,
      coordinates.altitude || 0,
    ],
  };

  console.log('📤 Sending location to WebSocket:', payload);
  socket.emit('maps', payload);
};

/**
 * Disconnect WebSocket connection
 * @param socket - Socket.IO client instance
 */
export const disconnectMapSocket = (socket: Socket): void => {
  if (socket.connected) {
    console.log('🔌 Disconnecting WebSocket...');
    socket.disconnect();
  }
};
