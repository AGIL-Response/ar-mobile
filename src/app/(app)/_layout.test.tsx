import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import AppLayout from './_layout';
import { AuthState } from '@/stores/auth';
import { createAuthState } from '@/lib/mock-data-tests';

const { __mockRedirect: mockRedirect } = require('expo-router');

const authStoreModule = require('@/stores/auth');

describe('AppLayout', () => {
  let useAuthStoreSpy: jest.SpyInstance<AuthState>;
  let mockAuthState: AuthState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockClear();

    mockAuthState = createAuthState({
      token: {
        accessToken: 'test-access-token',
        expiresIn: 1000,
        refreshToken: 'test-refresh-token',
      },
    });

    useAuthStoreSpy = jest
      .spyOn(authStoreModule, 'useAuthStore')
      .mockReturnValue(mockAuthState);
  });

  afterEach(() => {
    useAuthStoreSpy.mockRestore();
  });

  it('renders Stack when user is authenticated', () => {
    render(<AppLayout />);

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(useAuthStoreSpy).toHaveBeenCalled();
  });

  it('redirects to login when access token is missing', () => {
    mockAuthState.token.accessToken = undefined;

    render(<AppLayout />);

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when access token is empty string', () => {
    mockAuthState.token.accessToken = '';

    render(<AppLayout />);

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('renders Stack screens when authenticated', () => {
    mockAuthState.token.accessToken = 'valid-token';

    render(<AppLayout />);

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
