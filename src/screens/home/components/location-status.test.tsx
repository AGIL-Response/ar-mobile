import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { LocationStatus } from './location-status';

jest.mock('@/stores/location', () => ({
  __esModule: true,
  useLocationStore: jest.fn(),
}));

const locationStoreModule = require('@/stores/location');

describe('LocationStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    locationStoreModule.useLocationStore.mockImplementation(() => ({
      isMonitoring: false,
      isSocketConnected: false,
      hasLocationPermission: null,
      coordinates: null,
      error: null,
    }));
  });

  it('currently renders nothing (feature placeholder)', () => {
     render(<LocationStatus />);

    expect(screen).toBeTruthy();
  });
});
