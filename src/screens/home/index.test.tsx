import React from 'react';

import {
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import HomeScreen from './index';

const mockFlatViewRender = jest.fn();
const mockMapViewRender = jest.fn();
const mockLocationStatusRender = jest.fn();
const mockFabRender = jest.fn();

jest.mock('./components/flat-view', () => {
  const React = require('react');
  return {
    __esModule: true,
    FlatView: (props: unknown) => {
      mockFlatViewRender(props);
      return React.createElement('Text', null, 'Mock Flat View');
    },
  };
});

jest.mock('./components/location-status', () => {
  const React = require('react');
  return {
    __esModule: true,
    LocationStatus: (props: unknown) => {
      mockLocationStatusRender(props);
      return React.createElement('Text', null, 'Mock Location Status');
    },
  };
});

jest.mock('./components/floating-action-button', () => {
  const React = require('react');
  return {
    __esModule: true,
    FloatingActionButton: (props: unknown) => {
      mockFabRender(props);
      return React.createElement('Text', null, 'Mock FAB');
    },
  };
});

describe('HomeScreen', () => {
  const authStoreModule = require('@/stores/auth');
  let mockAuthState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthState = {
      selectedTenant: {
        id: 'tenant-1',
        name: 'Tenant Name',
        displayName: 'Tenant Display',
      },
    };

    authStoreModule.useAuthStore.mockImplementation((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockAuthState);
      }
      return mockAuthState;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the active tenant name in the header', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Mock Flat View')).toBeTruthy();
  });
});

