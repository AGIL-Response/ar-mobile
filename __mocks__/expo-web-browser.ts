/**
 * Mock for expo-web-browser
 * Used in tests to avoid native module dependencies
 */

const openBrowserAsyncMock = jest.fn().mockResolvedValue({
  type: 'opened',
});

const openAuthSessionAsyncMock = jest.fn().mockResolvedValue({
  type: 'success',
  url: 'exp://redirect?code=mock-code&state=mock-state',
});

const dismissBrowserMock = jest.fn().mockResolvedValue({});

const maybeCompleteAuthSessionMock = jest.fn().mockResolvedValue({
  type: 'success',
});

const warmUpAsyncMock = jest.fn().mockResolvedValue({});

const coolDownAsyncMock = jest.fn().mockResolvedValue({});

module.exports = {
  __esModule: true,
  openBrowserAsync: openBrowserAsyncMock,
  openAuthSessionAsync: openAuthSessionAsyncMock,
  dismissBrowser: dismissBrowserMock,
  maybeCompleteAuthSession: maybeCompleteAuthSessionMock,
  warmUpAsync: warmUpAsyncMock,
  coolDownAsync: coolDownAsyncMock,
  WebBrowserResultType: {
    CANCEL: 'cancel',
    DISMISS: 'dismiss',
    OPENED: 'opened',
    LOCKED: 'locked',
  },
  WebBrowserAuthSessionResult: {
    SUCCESS: 'success',
    CANCEL: 'cancel',
    DISMISS: 'dismiss',
    LOCKED: 'locked',
  },
  // Expose mocks for testing
  __openBrowserAsyncMock: openBrowserAsyncMock,
  __openAuthSessionAsyncMock: openAuthSessionAsyncMock,
  __dismissBrowserMock: dismissBrowserMock,
  __maybeCompleteAuthSessionMock: maybeCompleteAuthSessionMock,
  __warmUpAsyncMock: warmUpAsyncMock,
  __coolDownAsyncMock: coolDownAsyncMock,
};

