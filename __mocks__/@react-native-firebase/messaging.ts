// Create a singleton instance that's reused across all calls
const messagingInstance = {
  onMessage: jest.fn(() => jest.fn()), // Returns unsubscribe function
  onNotificationOpenedApp: jest.fn(() => jest.fn()), // Returns unsubscribe function
  onTokenRefresh: jest.fn(() => jest.fn()), // Returns unsubscribe function
  getInitialNotification: jest.fn().mockResolvedValue(null),
  requestPermission: jest.fn().mockResolvedValue(1), // AUTHORIZED
  hasPermission: jest.fn().mockResolvedValue(1), // AUTHORIZED
  getToken: jest.fn().mockResolvedValue('test-token'),
  deleteToken: jest.fn().mockResolvedValue(undefined),
  setBackgroundMessageHandler: jest.fn(),
};

// Return the same instance every time
const mockMessaging = () => messagingInstance;

// Add static properties
mockMessaging.AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  EPHEMERAL: 3,
};

export default mockMessaging;
export const FirebaseMessagingTypes = {} as any;