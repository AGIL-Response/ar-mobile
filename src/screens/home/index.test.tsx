import React from 'react';

import {
  findPressableParent,
  fireEvent,
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
  const { Text } = require('react-native');
  return {
    __esModule: true,
    FlatView: (props: unknown) => {
      mockFlatViewRender(props);
      return <Text>Mock Flat View</Text>;
    },
  };
});

jest.mock('./components/map-view', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    MapView: (props: unknown) => {
      mockMapViewRender(props);
      return <Text>Mock Map View</Text>;
    },
  };
});

jest.mock('./components/location-status', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    LocationStatus: (props: unknown) => {
      mockLocationStatusRender(props);
      return <Text>Mock Location Status</Text>;
    },
  };
});

jest.mock('./components/floating-action-button', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    FloatingActionButton: (props: unknown) => {
      mockFabRender(props);
      return <Text>Mock FAB</Text>;
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

    expect(screen.getByText('Tenant Display')).toBeTruthy();
  });

  it('falls back to tenant name when display name is missing', () => {
    mockAuthState.selectedTenant = {
      id: 'tenant-2',
      name: 'Operations',
      displayName: '',
    };

    render(<HomeScreen />);

    expect(screen.getByText('Operations')).toBeTruthy();
  });

  it('switches between flat and map tabs', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Mock Flat View')).toBeTruthy();
    expect(screen.queryByText('Mock Map View')).toBeNull();

    fireEvent.press(findPressableParent(screen.getByText('Map View')));

    expect(screen.getByText('Mock Map View')).toBeTruthy();
    expect(mockMapViewRender).toHaveBeenCalled();
  });
});

