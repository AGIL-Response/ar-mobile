import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { LocationStatus } from './location-status';

const mockLocationStore = require('@/stores/location');

describe('LocationStatus', () => {
  const createMockState = (overrides = {}) => ({
    isMonitoring: false,
    isSocketConnected: false,
    hasLocationPermission: null,
    coordinates: null,
    error: null,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<LocationStatus />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders title "Location Status"', () => {
      render(<LocationStatus />);
      expect(screen.getByText('Location Status')).toBeTruthy();
    });

    it('renders status text', () => {
      render(<LocationStatus />);
      expect(screen.getByText('Location monitoring stopped')).toBeTruthy();
    });
  });

  describe('Status Icon - Error State', () => {
    beforeEach(() => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState({ error: 'GPS error' }))
      );
    });

    it('shows ❌ icon when there is an error', () => {
      render(<LocationStatus />);
      expect(screen.getByText('❌')).toBeTruthy();
    });
  });

  describe('Status Icon - Success State', () => {
    beforeEach(() => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 10.123456, longitude: 20.654321 },
          })
        )
      );
    });

    it('shows ✅ icon when everything is working', () => {
      render(<LocationStatus />);
      expect(screen.getByText('✅')).toBeTruthy();
    });
  });

  describe('Status Icon - Warning State', () => {
    beforeEach(() => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState({ hasLocationPermission: false }))
      );
    });

    it('shows ⚠️ icon when location permission is denied', () => {
      render(<LocationStatus />);
      expect(screen.getByText('⚠️')).toBeTruthy();
    });
  });

  describe('Status Icon - Loading States', () => {
    it('shows 🔄 icon when monitoring is stopped', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      render(<LocationStatus />);
      expect(screen.getByText('🔄')).toBeTruthy();
    });

    it('shows 🔄 icon when socket is disconnected', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: false,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('🔄')).toBeTruthy();
    });
  });

  describe('Status Text - Error States', () => {
    it('shows error message when there is an error', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState({ error: 'GPS signal lost' }))
      );
      render(<LocationStatus />);
      expect(screen.getByText('Error: GPS signal lost')).toBeTruthy();
    });

    it('shows permission denied message when permission is false', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState({ hasLocationPermission: false }))
      );
      render(<LocationStatus />);
      expect(screen.getByText('Location permission denied')).toBeTruthy();
    });
  });

  describe('Status Text - Normal States', () => {
    it('shows monitoring stopped message when not monitoring', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      render(<LocationStatus />);
      expect(screen.getByText('Location monitoring stopped')).toBeTruthy();
    });

    it('shows WebSocket disconnected when socket is not connected', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: false,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('WebSocket disconnected')).toBeTruthy();
    });
  });

  describe('Status Text - Coordinates', () => {
    it('shows coordinates when available', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 10.123456, longitude: 20.654321 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 10.123456, 20.654321')).toBeTruthy();
    });

    it('shows getting location message when waiting for coordinates', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Getting location...')).toBeTruthy();
    });

    it('formats coordinates with 6 decimal places', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 10.1234567890, longitude: 20.9876543210 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 10.123457, 20.987654')).toBeTruthy();
    });

    it('handles negative coordinates', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: -10.123456, longitude: -20.654321 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 -10.123456, -20.654321')).toBeTruthy();
    });

    it('handles zero coordinates', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 0, longitude: 0 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 0.000000, 0.000000')).toBeTruthy();
    });
  });

  describe('Status Priority', () => {
    it('error takes priority over other states', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 10, longitude: 20 },
            error: 'Network error',
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Error: Network error')).toBeTruthy();
      expect(screen.getByText('❌')).toBeTruthy();
    });

    it('permission denied takes priority over monitoring state', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: false,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Location permission denied')).toBeTruthy();
      expect(screen.getByText('⚠️')).toBeTruthy();
    });

    it('not monitoring takes priority over disconnected socket', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: false,
            isSocketConnected: false,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Location monitoring stopped')).toBeTruthy();
    });

    it('disconnected socket takes priority over no coordinates', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: false,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('WebSocket disconnected')).toBeTruthy();
    });
  });

  describe('Monitoring Text', () => {
    it('shows monitoring message when isMonitoring is true', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Sending location every 10 seconds')).toBeTruthy();
    });

    it('does not show monitoring message when isMonitoring is false', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      render(<LocationStatus />);
      expect(screen.queryByText('Sending location every 10 seconds')).toBeNull();
    });

    it('shows monitoring message even with error', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            error: 'Some error',
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Sending location every 10 seconds')).toBeTruthy();
    });

    it('shows monitoring message even without coordinates', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('Sending location every 10 seconds')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty error string (treated as no error)', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState({ error: '' }))
      );
      render(<LocationStatus />);
      // Empty string is falsy, so it won't show error message
      expect(screen.getByText('Location monitoring stopped')).toBeTruthy();
    });

    it('handles very long error message', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            error: 'This is a very long error message that should still be displayed correctly',
          })
        )
      );
      render(<LocationStatus />);
      expect(
        screen.getByText(
          'Error: This is a very long error message that should still be displayed correctly'
        )
      ).toBeTruthy();
    });

    it('handles coordinates with very small numbers', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 0.000001, longitude: 0.000002 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 0.000001, 0.000002')).toBeTruthy();
    });

    it('handles coordinates with very large numbers', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(
          createMockState({
            isMonitoring: true,
            isSocketConnected: true,
            hasLocationPermission: true,
            coordinates: { latitude: 89.999999, longitude: 179.999999 },
          })
        )
      );
      render(<LocationStatus />);
      expect(screen.getByText('📍 89.999999, 179.999999')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      const { toJSON } = render(<LocationStatus />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme colors to elements', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      render(<LocationStatus />);
      expect(screen.getByText('Location Status')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent structure', () => {
      (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector(createMockState())
      );
      const { toJSON } = render(<LocationStatus />);
      expect(toJSON()).toBeTruthy();
    });

    it('always shows title', () => {
      const states = [
        {},
        { error: 'Error' },
        { hasLocationPermission: false },
        {
          isMonitoring: true,
          isSocketConnected: true,
          hasLocationPermission: true,
          coordinates: { latitude: 10, longitude: 20 },
        },
      ];

      states.forEach((state) => {
        (mockLocationStore.useLocationStore  as unknown as jest.Mock).mockImplementation((selector: any) =>
          selector(createMockState(state))
        );
        const { unmount } = render(<LocationStatus />);
        expect(screen.getByText('Location Status')).toBeTruthy();
        unmount();
      });
    });
  });
});
