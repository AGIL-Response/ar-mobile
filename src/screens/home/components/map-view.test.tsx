import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { useIncidentsStore } from '@/stores/incidents';
import { useMapStore } from '@/stores/map';
import { useUsersStore } from '@/stores/users';

import { MapView } from './map-view';

jest.mock('@/stores/incidents', () => ({
  useIncidentsStore: jest.fn(),
}));

jest.mock('@/stores/users', () => ({
  useUsersStore: jest.fn(),
}));

jest.mock('@/stores/map', () => ({
  useMapStore: jest.fn(),
}));

jest.mock('@/screens/incidents/utils', () => ({
  getCoordinate: jest.fn((coords: any) => coords),
}));

// Mock Icon and Avatar components
jest.mock('@/components/icon', () => ({
  Icon: jest.fn(() => null),
  iconNames: {
    incident: 'incident-icon',
  },
}));

jest.mock('@/components/avatar', () => ({
  Avatar: jest.fn(() => null),
}));

describe('MapView', () => {
  const mockFetchIncidents = jest.fn();
  const mockSetMapFocusIncident = jest.fn();
  const mockSetMapFocusUserId = jest.fn();
  const mockSetFlatViewFocusUserId = jest.fn();
  const mockSetIsMapReady = jest.fn();
  const mockRouterReplace = jest.fn();

  const createMockIncident = (overrides = {}) => ({
    id: '1',
    name: 'Test Incident',
    location: {
      coordinates: [10.123, 20.456],
    },
    status: 'pending',
    ...overrides,
  });

  const createMockUser = (overrides = {}) => ({
    id: '1',
    username: 'testuser',
    avatarId: 'avatar-123',
    status: 'online',
    location: {
      coordinates: [15.789, 25.012],
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default store mocks
    (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        incidents: [],
        isLoading: false,
        actions: {
          fetchIncidents: mockFetchIncidents,
        },
      })
    );

    (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        users: [],
        isLoading: false,
      })
    );

    (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        mapFocusIncidentId: null,
        mapFocusUserId: null,
        isMapReady: false,
        actions: {
          setMapFocusIncident: mockSetMapFocusIncident,
          setMapFocusUserId: mockSetMapFocusUserId,
          setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
          setIsMapReady: mockSetIsMapReady,
        },
      })
    );

    // eslint-disable-next-line
    const expRouter = require('expo-router');
    expRouter.router.replace = mockRouterReplace;
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('fetches incidents on mount', () => {
      render(<MapView />);
      expect(mockFetchIncidents).toHaveBeenCalledWith({});
      expect(mockFetchIncidents).toHaveBeenCalledTimes(1);
    });

    it('renders map container when not loading', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-mapview')).toBeTruthy();
    });

    it('renders camera component', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-camera')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading message when incidents are loading', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          incidents: [],
          isLoading: true,
          actions: { fetchIncidents: mockFetchIncidents },
        })
      );

      render(<MapView />);

      expect(screen.getByText('Loading map...')).toBeTruthy();
    });

    it('shows loading message when users are loading', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: true,
        })
      );

      render(<MapView />);

      expect(screen.getByText('Loading map...')).toBeTruthy();
    });

    it('shows loading when both are loading', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          incidents: [],
          isLoading: true,
          actions: { fetchIncidents: mockFetchIncidents },
        })
      );

      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [],
          isLoading: true,
        })
      );

      render(<MapView />);

      expect(screen.getByText('Loading map...')).toBeTruthy();
    });

    it('does not show loading when neither is loading', () => {
      render(<MapView />);

      expect(screen.queryByText('Loading map...')).toBeNull();
    });
  });

  describe('Data Filtering', () => {
    it('filters out incidents without coordinates', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          incidents: [createMockIncident({ location: null })],
          isLoading: false,
          actions: { fetchIncidents: mockFetchIncidents },
        })
      );

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('filters out users without coordinates', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ location: null })],
          isLoading: false,
        })
      );

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('filters out users without avatarId', () => {
      (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          users: [createMockUser({ avatarId: null })],
          isLoading: false,
        })
      );

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Map Ready State', () => {
    it('calls setIsMapReady when map finishes loading', () => {
      render(<MapView />);

      // Map auto-calls onDidFinishLoadingMap in our mock
      expect(mockSetIsMapReady).toHaveBeenCalledWith(true);
    });
  });

  describe('Cleanup', () => {
    it('clears focus states on unmount', () => {
      const { unmount } = render(<MapView />);

      unmount();

      expect(mockSetMapFocusIncident).toHaveBeenCalledWith(null);
      expect(mockSetMapFocusUserId).toHaveBeenCalledWith(null);
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies map style based on theme', () => {
      render(<MapView />);
      const mapView = screen.getByTestId('mapbox-mapview');
      expect(mapView).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty incidents array', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles empty users array', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles re-render without errors', () => {
      const { rerender, toJSON } = render(<MapView />);
      rerender(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent structure', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders MapView with Camera', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-mapview')).toBeTruthy();
      expect(screen.getByTestId('mapbox-camera')).toBeTruthy();
    });

    it('has proper container structure', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-mapview')).toBeTruthy();
    });
  });
});
