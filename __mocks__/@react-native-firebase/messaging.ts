const mockMessaging = () => ({
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    requestPermission: jest.fn().mockResolvedValue(true),
    hasPermission: jest.fn().mockResolvedValue(true),
    getToken: jest.fn().mockResolvedValue('test-token'),
    deleteToken: jest.fn().mockResolvedValue(undefined),
  });
  
export default mockMessaging;
export const FirebaseMessagingTypes = {} as any;