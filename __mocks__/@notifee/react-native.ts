const notifee = {
    requestPermission: jest.fn().mockResolvedValue(true),
    getInitialNotification: jest.fn().mockResolvedValue(null),
    onForegroundEvent: jest.fn().mockImplementation(() => jest.fn()),
    onBackgroundEvent: jest.fn(),
    displayNotification: jest.fn().mockResolvedValue(undefined),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    createChannel: jest.fn().mockResolvedValue('channel-id'),
    createChannelGroup: jest.fn().mockResolvedValue('channel-group-id'),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    getBadgeCount: jest.fn().mockResolvedValue(0),
  };
  
  export default notifee;
  
  // Export enums/types you use in code as simple objects so imports work
  export const AndroidImportance = {
    DEFAULT: 3,
    HIGH: 4,
    LOW: 2,
    MIN: 1,
    MAX: 5,
  } as any;
  
  export const EventType = {
    DISMISSED: 'DISMISSED',
    PRESS: 'PRESS',
  } as any;