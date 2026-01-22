export const mockSocket = {
  id: 'mock-socket-id',
  connected: true,
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  onAny: jest.fn(),
  io: {
    engine: {
      transport: {
        name: 'websocket',
      },
      on: jest.fn(),
    },
  },
};

export const io = jest.fn(() => mockSocket);

