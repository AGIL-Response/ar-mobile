/**
 * Mock for expo-auth-session
 * Used in tests to avoid native module dependencies
 */

const mockRequest = {
  codeVerifier: 'mock-code-verifier',
  codeChallenge: 'mock-code-challenge',
  codeChallengeMethod: 'S256',
  state: 'mock-state',
  url: 'https://mock-auth-url.com',
};

const mockResponse = {
  type: 'success',
  params: {
    code: 'mock-authorization-code',
    state: 'mock-state',
  },
  authentication: null,
  url: 'https://mock-redirect-url.com',
  error: null,
  errorCode: null,
};

const promptAsyncMock = jest.fn().mockResolvedValue(mockResponse);

const useAuthRequestMock = jest.fn(() => [
  mockRequest,
  mockResponse,
  promptAsyncMock,
]);

const exchangeCodeAsyncMock = jest.fn().mockResolvedValue({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  idToken: 'mock-id-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  issuedAt: Date.now() / 1000,
  scope: 'openid',
});

const makeRedirectUriMock = jest.fn((config?: any) => {
  return config?.path
    ? `${config.scheme || 'exp'}://${config.path}`
    : 'exp://redirect';
});

const fetchDiscoveryAsyncMock = jest.fn().mockResolvedValue({
  authorizationEndpoint: 'https://mock-auth.com/authorize',
  tokenEndpoint: 'https://mock-auth.com/token',
  revocationEndpoint: 'https://mock-auth.com/revoke',
  endSessionEndpoint: 'https://mock-auth.com/logout',
  userInfoEndpoint: 'https://mock-auth.com/userinfo',
});

module.exports = {
  __esModule: true,
  useAuthRequest: useAuthRequestMock,
  exchangeCodeAsync: exchangeCodeAsyncMock,
  makeRedirectUri: makeRedirectUriMock,
  fetchDiscoveryAsync: fetchDiscoveryAsyncMock,
  ResponseType: {
    Code: 'code',
    Token: 'token',
  },
  CodeChallengeMethod: {
    Plain: 'plain',
    S256: 'S256',
  },
  Prompt: {
    None: 'none',
    Login: 'login',
    Consent: 'consent',
    SelectAccount: 'select_account',
  },
  // Expose mocks for testing
  __promptAsyncMock: promptAsyncMock,
  __useAuthRequestMock: useAuthRequestMock,
  __exchangeCodeAsyncMock: exchangeCodeAsyncMock,
  __makeRedirectUriMock: makeRedirectUriMock,
  __fetchDiscoveryAsyncMock: fetchDiscoveryAsyncMock,
  __mockRequest: mockRequest,
  __mockResponse: mockResponse,
};

