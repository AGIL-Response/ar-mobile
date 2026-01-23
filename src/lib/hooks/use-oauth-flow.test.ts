/* eslint-disable import/first */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import type * as AuthSessionTypes from 'expo-auth-session';

// Shared mock state for expo-auth-session
const mockRequest: any = {
  codeVerifier: 'verifier',
  codeChallenge: 'challenge',
  codeChallengeMethod: 'S256',
  state: 'state123',
};

let currentResponse: AuthSessionTypes.AuthSessionResult | null = null;

const mockPromptAsync = jest.fn(() => Promise.resolve());

const mockWebBrowserModule = require('expo-web-browser');
const mockOpenAuthSessionAsync = mockWebBrowserModule.__openAuthSessionAsyncMock;


// Import after mocks
import { useOAuthFlow } from './use-oauth-flow';
// Get the actual mock functions from the mocked module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const authSessionModule = require('expo-auth-session');
const actualMockMakeRedirectUri = authSessionModule.__mockMakeRedirectUri || authSessionModule.makeRedirectUri;
const actualMockUseAuthRequest = authSessionModule.__mockUseAuthRequest || authSessionModule.useAuthRequest;
const actualMockExchangeCodeAsync = authSessionModule.__mockExchangeCodeAsync || authSessionModule.exchangeCodeAsync;

describe('useOAuthFlow', () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    currentResponse = null;

    // Reset mock implementations
    actualMockMakeRedirectUri.mockReturnValue('agilresponse://redirect');
    actualMockUseAuthRequest.mockImplementation(() => [mockRequest, currentResponse, mockPromptAsync]);
    actualMockExchangeCodeAsync.mockClear();
    mockOpenAuthSessionAsync.mockClear();
    mockPromptAsync.mockClear();
    onSuccess.mockClear();
    onError.mockClear();
  });

  it('initializes auth request and exposes redirectUri and isReady', () => {
    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user1',
        onSuccess,
        onError,
      },
    });

    expect(actualMockMakeRedirectUri).toHaveBeenCalledWith({
      scheme: 'agilresponse',
      path: '(app)/(tabs)',
    });
    expect(result.current.redirectUri).toBe('agilresponse://redirect');
    expect(result.current.isReady).toBe(true);
  });

  it('isReady is false when realm is empty', () => {
    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: '',
        username: 'user1',
        onSuccess,
        onError,
      },
    });

    expect(result.current.isReady).toBe(false);
  });

  it('passes login_hint when username is provided', () => {
    renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user-login',
        onSuccess,
        onError,
      },
    });

    const [config] = actualMockUseAuthRequest.mock.calls[0] as any[];
    expect(config.extraParams).toEqual({ login_hint: 'user-login' });
  });

  it('does not set login_hint when username is undefined', () => {
    renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: undefined,
        onSuccess,
        onError,
      },
    });

    const [config] = actualMockUseAuthRequest.mock.calls[0] as any[];
    expect(config.extraParams).toEqual({});
  });

  it('startLoginFlow calls promptAsync when request is ready', async () => {
    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'u',
        onSuccess,
        onError,
      },
    });

    await act(async () => {
      await result.current.startLoginFlow();
    });

    expect(mockPromptAsync).toHaveBeenCalledTimes(1);
  });

  it('startLoginFlow calls onError when request is not ready', async () => {
    actualMockUseAuthRequest.mockImplementationOnce(() => [null, currentResponse, mockPromptAsync]);

    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'u',
        onSuccess,
        onError,
      },
    });

    await act(async () => {
      await result.current.startLoginFlow();
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Auth request not ready');
  });

  it('handles successful OAuth response and exchanges code for token', async () => {
    actualMockExchangeCodeAsync.mockResolvedValueOnce({ accessToken: 'access', refreshToken: 'refresh' });

    const { result, rerender } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    expect(result.current.isProcessing).toBe(false);

    currentResponse = {
      type: 'success',
      params: { code: 'auth-code-123' },
      url: 'https://redirect',
    } as any;

    act(() => {
      rerender({
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      });
    });

    await waitFor(() => {
      expect(actualMockExchangeCodeAsync).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    const [requestConfig, discovery] = actualMockExchangeCodeAsync.mock.calls[0] as any[];
    expect(requestConfig).toEqual({
      clientId: 'test-client',
      code: 'auth-code-123',
      redirectUri: 'agilresponse://redirect',
      extraParams: { code_verifier: mockRequest.codeVerifier },
    });
    expect(discovery).toEqual({
      authorizationEndpoint: 'https://keycloak.test/demo/auth',
      revocationEndpoint: 'https://keycloak.test/realms/demo/protocol/openid-connect/revoke',
      tokenEndpoint: 'https://keycloak.test/demo/token',
    });

    expect(result.current.isProcessing).toBe(false);
  });

  it('calls onError when OAuth response is error', async () => {
    const { rerender } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    currentResponse = {
      type: 'error',
      error: { message: 'bad', description: 'fail' } as any,
      params: {},
      url: 'https://redirect',
    } as any;

    act(() => {
      rerender({
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });

    const err = onError.mock.calls[0][0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('bad');
  });

  it('logs and ignores dismiss/cancel responses', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const { rerender } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    currentResponse = {
      type: 'dismiss',
      params: {},
      url: 'https://redirect',
    } as any;

    act(() => {
      rerender({
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('startChangePasswordFlow returns false and calls onError when request or realm missing', async () => {
    actualMockUseAuthRequest.mockImplementationOnce(() => [null, currentResponse, mockPromptAsync]);

    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: '',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    await act(async () => {
      const ok = await result.current.startChangePasswordFlow();
      expect(ok).toBe(false);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('Auth request not ready');
  });

  it('startChangePasswordFlow opens WebBrowser with correct URL and returns true on success', async () => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({ type: 'success', url: 'redirect' });

    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    let ok: boolean = false;
    await act(async () => {
      ok = await result.current.startChangePasswordFlow();
    });

    expect(ok).toBe(true);

    expect(mockOpenAuthSessionAsync).toHaveBeenCalledTimes(1);
    const [authUrl, redirectUri] = mockOpenAuthSessionAsync.mock.calls[0] as any[];

    expect(redirectUri).toBe('agilresponse://redirect');

    const url = new URL(authUrl);
    const params = url.searchParams;

    expect(url.origin).toBe('https://keycloak.test');
    expect(url.pathname).toBe('/demo/auth');
    expect(params.get('client_id')).toBe('test-client');
    expect(params.get('redirect_uri')).toBe('agilresponse://redirect');
    expect(params.get('response_type')).toBe('code');
    expect(params.get('scope')).toBe('openid profile');
    expect(params.get('kc_action')).toBe('UPDATE_PASSWORD');
    expect(params.get('code_challenge')).toBe(mockRequest.codeChallenge);
    expect(params.get('code_challenge_method')).toBe(mockRequest.codeChallengeMethod);
    expect(params.get('state')).toBe(mockRequest.state);
    expect(params.get('login_hint')).toBe('user');
  });

  it('startChangePasswordFlow returns false on cancel/dismiss', async () => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' });

    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    let ok: boolean = true;
    await act(async () => {
      ok = await result.current.startChangePasswordFlow();
    });

    expect(ok).toBe(false);
  });

  it('startChangePasswordFlow calls onError and returns false on exception', async () => {
    mockOpenAuthSessionAsync.mockRejectedValueOnce(new Error('browser failed'));

    const { result } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    let ok: boolean = true;
    await act(async () => {
      ok = await result.current.startChangePasswordFlow();
    });

    expect(ok).toBe(false);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('browser failed');
  });

  it('exchangeCodeForToken propagates error via onError and resets isProcessing', async () => {
    actualMockExchangeCodeAsync.mockRejectedValueOnce(new Error('token error'));

    const { result, rerender } = renderHook((props: any) => useOAuthFlow(props), {
      initialProps: {
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      },
    });

    currentResponse = {
      type: 'success',
      params: { code: 'auth-code-123' },
      url: 'https://redirect',
    } as any;

    act(() => {
      rerender({
        realm: 'demo',
        username: 'user',
        onSuccess,
        onError,
      });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });

    expect(onError.mock.calls[0][0].message).toBe('token error');
    expect(result.current.isProcessing).toBe(false);
  });
});

