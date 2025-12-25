const requestCameraPermissionMock = jest.fn();
const requestGalleryPermissionMock = jest.fn();
const launchCameraAsyncMock = jest.fn();
const launchImageLibraryAsyncMock = jest.fn();

// Create PermissionStatus object
const PermissionStatusValue = {
  UNDETERMINED: 'undetermined',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

module.exports = {
  __esModule: true,
  get PermissionStatus() {
    return PermissionStatusValue;
  },
  permissions: {
    UNDETERMINED: 'undetermined',
    DENIED: 'denied',
    GRANTED: 'granted',
  },
  MediaTypeOptions: {
    All: 'All',
    Images: 'Images',
    Videos: 'Videos',
  },
  useCameraPermissions: jest.fn(() => [
    { status: PermissionStatusValue.UNDETERMINED },
    requestCameraPermissionMock,
  ]),
  useMediaLibraryPermissions: jest.fn(() => [
    { status: PermissionStatusValue.UNDETERMINED },
    requestGalleryPermissionMock,
  ]),
  launchCameraAsync: launchCameraAsyncMock,
  launchImageLibraryAsync: launchImageLibraryAsyncMock,
  // Expose mocks for testing
  __requestCameraPermissionMock: requestCameraPermissionMock,
  __requestGalleryPermissionMock: requestGalleryPermissionMock,
  __launchCameraAsyncMock: launchCameraAsyncMock,
  __launchImageLibraryAsyncMock: launchImageLibraryAsyncMock,
};
