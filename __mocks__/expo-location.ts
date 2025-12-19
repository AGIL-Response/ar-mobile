module.exports = {
  __esModule: true,
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  permissions: {
    UNDETERMINED: 'undetermined',
    DENIED: 'denied',
    GRANTED: 'granted',
  },
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  openSettings: jest.fn(),
  useForegroundPermissions: jest.fn(),
  useBackgroundPermissions: jest.fn(),
  useBackgroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
};
