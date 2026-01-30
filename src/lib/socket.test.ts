/* eslint-disable import/first */
// Unmock socket to test the actual implementation
jest.mock('@/lib/socket', () => {
  return jest.requireActual('@/lib/socket');
});

import { io } from 'socket.io-client';
import {
  initMapSocket,
  handleListenMapSocket,
  sendLocationToSocket,
  disconnectMapSocket,
  type LocationCoordinates,
  type SocketLocationUpdateEvent,
} from './socket';

// Get the global mock socket
const socketIoModule = jest.requireMock('socket.io-client');
const globalMockSocket = socketIoModule.mockSocket;

describe('socket', () => {
  let mockSocket: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Use the global mock but reset its state for each test
    mockSocket = globalMockSocket;
    mockSocket.id = 'mock-socket-id';
    mockSocket.connected = true;
    mockSocket.on = jest.fn();
    mockSocket.emit = jest.fn();
    mockSocket.disconnect = jest.fn();
    mockSocket.onAny = jest.fn();
    mockSocket.io = {
      engine: {
        transport: {
          name: 'websocket',
        },
        on: jest.fn(),
      },
    };

    (io as jest.Mock).mockReturnValue(mockSocket);

    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initMapSocket', () => {
    it('creates socket with correct configuration', () => {
      const accessToken = 'test-access-token';
      const socket = initMapSocket(accessToken);

      expect(io).toHaveBeenCalledWith('https://dev.agilres.net', {
        path: '/api/be/ws',
        withCredentials: true,
        auth: {
          authorization: `Bearer ${accessToken}`,
        },
        transports: ['websocket', 'polling'],
      });

      expect(socket).toBe(mockSocket);
    });

    it('creates socket with different access tokens', () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      initMapSocket(token1);
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: {
            authorization: `Bearer ${token1}`,
          },
        })
      );

      jest.clearAllMocks();

      initMapSocket(token2);
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: {
            authorization: `Bearer ${token2}`,
          },
        })
      );
    });
  });

  describe('handleListenMapSocket', () => {
    let onLocationUpdate: jest.Mock;

    beforeEach(() => {
      onLocationUpdate = jest.fn();
    });

    it('sets up maps event listener', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.on).toHaveBeenCalledWith('maps', expect.any(Function));
    });

    it('handles location update event with object data', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const locationData: SocketLocationUpdateEvent = {
        event: 'locations.updated',
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              coordinates: [123.456, 45.678, 100],
            },
            properties: {
              entityId: 'entity-1',
              status: 'active',
            },
          },
        ],
      };

      mapsHandler(locationData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📩 Processing location update:',
        locationData
      );
      expect(onLocationUpdate).toHaveBeenCalledWith(locationData);
    });

    it('handles location update event with string JSON data', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const locationData: SocketLocationUpdateEvent = {
        event: 'locations.updated',
        type: 'FeatureCollection',
        features: [],
      };

      mapsHandler(JSON.stringify(locationData));

      expect(onLocationUpdate).toHaveBeenCalledWith(locationData);
    });

    it('does not call onLocationUpdate for string data without locations.updated event', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const nonLocationData = JSON.stringify({
        event: 'other.event',
        type: 'FeatureCollection',
        features: [],
      });

      mapsHandler(nonLocationData);

      expect(onLocationUpdate).not.toHaveBeenCalled();
    });

    it('handles error event with 401 status', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const errorData = {
        event: 'error',
        data: {
          error: {
            status: 401,
          },
        },
      };

      mapsHandler(errorData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Socket error event:',
        errorData
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🔐 Authentication failed - token may be invalid or expired'
      );
    });

    it('handles error event without 401 status', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const errorData = {
        event: 'error',
        data: {
          error: {
            status: 500,
          },
        },
      };

      mapsHandler(errorData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Socket error event:',
        errorData
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        '🔐 Authentication failed - token may be invalid or expired'
      );
    });

    it('handles non-location data', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const otherData = {
        event: 'other.event',
        data: { some: 'data' },
      };

      mapsHandler(otherData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📩 Received non-location data:',
        otherData
      );
      expect(onLocationUpdate).not.toHaveBeenCalled();
    });

    it('handles invalid JSON string gracefully', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const invalidJson = 'invalid json string';

      mapsHandler(invalidJson);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing socket data:',
        expect.any(Error),
        'Raw data:',
        invalidJson
      );
    });

    it('handles null/undefined data gracefully', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      mapsHandler(null);
      mapsHandler(undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📩 Received non-location data:',
        null
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📩 Received non-location data:',
        undefined
      );
    });

    it('sets up disconnect event listener', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function)
      );

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'disconnect'
      )?.[1];

      disconnectHandler('transport close');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '❌ WebSocket disconnected:',
        mockSocket.id,
        'transport close'
      );
    });

    it('sets up connect event listener', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));

      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect'
      )?.[1];

      connectHandler();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ WebSocket connected:',
        mockSocket.id
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔗 Socket transport:',
        mockSocket.io.engine.transport.name
      );
    });

    it('sets up transport upgrade listener', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.io.engine.on).toHaveBeenCalledWith(
        'upgrade',
        expect.any(Function)
      );

      const upgradeHandler = mockSocket.io.engine.on.mock.calls.find(
        (call: any[]) => call[0] === 'upgrade'
      )?.[1];

      const mockTransport = { name: 'polling' };
      upgradeHandler(mockTransport);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🚀 Transport upgraded to:',
        mockTransport.name
      );
    });

    it('sets up connect_error event listener', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect_error',
        expect.any(Function)
      );

      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect_error'
      )?.[1];

      const error = new Error('Connection failed');
      errorHandler(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ WebSocket connection error:',
        error
      );
    });

    it('sets up onAny listener for debugging', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      expect(mockSocket.onAny).toHaveBeenCalledWith(expect.any(Function));

      const onAnyHandler = mockSocket.onAny.mock.calls[0][0];

      onAnyHandler('other-event', 'arg1', 'arg2');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 Socket event:',
        'other-event',
        ['arg1', 'arg2']
      );
    });

    it('does not log onAny events for maps event', () => {
      handleListenMapSocket(mockSocket, onLocationUpdate);

      const onAnyHandler = mockSocket.onAny.mock.calls[0][0];

      onAnyHandler('maps', { data: 'test' });

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        '🔍 Socket event:',
        'maps',
        expect.anything()
      );
    });

    it('works without onLocationUpdate callback', () => {
      handleListenMapSocket(mockSocket);

      const mapsHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'maps'
      )?.[1];

      const locationData: SocketLocationUpdateEvent = {
        event: 'locations.updated',
        type: 'FeatureCollection',
        features: [],
      };

      // Should not throw
      expect(() => mapsHandler(locationData)).not.toThrow();
    });
  });

  describe('sendLocationToSocket', () => {
    const mockCoordinates: LocationCoordinates = {
      longitude: 123.456,
      latitude: 45.678,
      altitude: 100,
    };

    it('does not send when socket is not connected', () => {
      mockSocket.connected = false;

      sendLocationToSocket(mockSocket, mockCoordinates);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️ WebSocket not connected, cannot send location'
      );
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('sends location with coordinates only', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
      });
    });

    it('sends location with default altitude when not provided', () => {
      mockSocket.connected = true;
      const coordinatesWithoutAltitude: LocationCoordinates = {
        longitude: 123.456,
        latitude: 45.678,
      };

      sendLocationToSocket(mockSocket, coordinatesWithoutAltitude);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 0],
      });
    });

    it('sends location with networkMbps attribute', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, 50.5);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          networkMbps: 50.5,
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 Attributes being added:',
        expect.objectContaining({
          networkMbps: 50.5,
        })
      );
    });

    it('sends location with batteryPercentage attribute', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, undefined, 85);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          batteryPercentage: 85,
        },
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 Attributes being added:',
        expect.objectContaining({
          batteryPercentage: 85,
        })
      );
    });

    it('sends location with both networkMbps and batteryPercentage', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, 50.5, 85);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          networkMbps: 50.5,
          batteryPercentage: 85,
        },
      });
    });

    it('does not include attributes when both are null', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, null, null);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 Skipping attributes (both values are null/undefined):',
        {
          networkMbps: null,
          batteryPercentage: null,
        }
      );
    });

    it('does not include attributes when both are undefined', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, undefined, undefined);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🔍 Skipping attributes (both values are null/undefined):',
        {
          networkMbps: undefined,
          batteryPercentage: undefined,
        }
      );
    });

    it('includes attributes when only networkMbps is provided (batteryPercentage is null)', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, 50.5, null);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          networkMbps: 50.5,
        },
      });
    });

    it('includes attributes when only batteryPercentage is provided (networkMbps is null)', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, null, 85);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          batteryPercentage: 85,
        },
      });
    });

    it('includes attributes when only networkMbps is provided (batteryPercentage is undefined)', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, 50.5, undefined);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          networkMbps: 50.5,
        },
      });
    });

    it('includes attributes when only batteryPercentage is provided (networkMbps is undefined)', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, undefined, 85);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          batteryPercentage: 85,
        },
      });
    });

    it('handles zero values for networkMbps and batteryPercentage', () => {
      mockSocket.connected = true;

      sendLocationToSocket(mockSocket, mockCoordinates, 0, 0);

      expect(mockSocket.emit).toHaveBeenCalledWith('maps', {
        coordinates: [123.456, 45.678, 100],
        attributes: {
          networkMbps: 0,
          batteryPercentage: 0,
        },
      });
    });
  });

  describe('disconnectMapSocket', () => {
    it('disconnects when socket is connected', () => {
      mockSocket.connected = true;

      disconnectMapSocket(mockSocket);

      expect(consoleLogSpy).toHaveBeenCalledWith('🔌 Disconnecting WebSocket...');
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('does not disconnect when socket is not connected', () => {
      mockSocket.connected = false;

      disconnectMapSocket(mockSocket);

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        '🔌 Disconnecting WebSocket...'
      );
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });
  });
});

