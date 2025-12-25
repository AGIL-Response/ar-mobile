import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { router } from 'expo-router';
import MapView from './index';

/* eslint-disable @typescript-eslint/no-require-imports */
const mockIncidentsStore = require('@/stores/incidents');
const mockUsersStore = require('@/stores/users');
const mockMapStore = require('@/stores/map');
const mockAuthStore = require('@/stores/auth');
/* eslint-enable @typescript-eslint/no-require-imports */

// Mock Avatar component (used in user markers)
jest.mock('@/components/avatar', () => ({
  Avatar: ({ fileId, status, size, isMapAvatar, ...props }: any) => {
    const React = require('react');
    const RN = require('react-native');
    return React.createElement(
      RN.View,
      { testID: 'avatar-component', ...props },
      React.createElement(RN.Text, {}, `Avatar-${fileId}`)
    );
  },
}));

describe('MapView', () => {
  const mockNavigate = jest.fn();
  const mockReplace = jest.fn();
  const mockFetchIncidents = jest.fn();
  const mockSetMapFocusIncident = jest.fn();
  const mockSetMapFocusUserId = jest.fn();
  const mockSetFlatViewFocusUserId = jest.fn();
  const mockSetIsMapReady = jest.fn();
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (router.navigate as jest.Mock) = mockNavigate;
    (router.replace as jest.Mock) = mockReplace;

    // Setup incidents store
    mockIncidentsStore.useIncidentsStore.mockImplementation((selector?: any) => {
      const state = {
        incidents: [],
        isLoading: false,
        error: null,
        actions: {
          fetchIncidents: mockFetchIncidents,
        },
      };
      return selector ? selector(state) : state;
    });

    // Setup users store
    mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
      const state = {
        users: [],
        isLoading: false,
        error: null,
      };
      return selector ? selector(state) : state;
    });

    // Setup map store
    mockMapStore.useMapStore.mockImplementation((selector?: any) => {
      const state = {
        mapFocusIncidentId: null,
        mapFocusUserId: null,
        isMapReady: false,
        actions: {
          setMapFocusIncident: mockSetMapFocusIncident,
          setMapFocusUserId: mockSetMapFocusUserId,
          setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
          setIsMapReady: mockSetIsMapReady,
        },
      };
      return selector ? selector(state) : state;
    });

    // Setup auth store
    mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
      const state = {
        selectedTeam: {
          id: 'team-1',
          name: 'Test Team',
        },
      };
      return selector ? selector(state) : state;
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders Mapbox MapView', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-mapview')).toBeTruthy();
    });

    it('renders Mapbox Camera', () => {
      render(<MapView />);
      expect(screen.getByTestId('mapbox-camera')).toBeTruthy();
    });

    it('calls fetchIncidents on mount', () => {
      render(<MapView />);
      expect(mockFetchIncidents).toHaveBeenCalledWith({});
    });
  });

  describe('Incident Markers', () => {
    it('handles incidents with coordinates', () => {
      mockIncidentsStore.useIncidentsStore.mockImplementation((selector?: any) => {
        const state = {
          incidents: [
            {
              id: 'incident-1',
              name: 'Test Incident',
              location: {
                coordinates: [106.7, 10.8],
              },
            },
          ],
          isLoading: false,
          error: null,
          actions: {
            fetchIncidents: mockFetchIncidents,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles incidents without coordinates', () => {
      mockIncidentsStore.useIncidentsStore.mockImplementation((selector?: any) => {
        const state = {
          incidents: [
            {
              id: 'incident-1',
              name: 'Test Incident',
              location: null,
            },
          ],
          isLoading: false,
          error: null,
          actions: {
            fetchIncidents: mockFetchIncidents,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('User Markers', () => {
    it('handles users with coordinates and avatarId', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              name: 'Test User',
              avatarId: 'avatar-123',
              location: {
                coordinates: [106.7, 10.8],
              },
              status: 'available',
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles users without avatarId', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              name: 'Test User',
              avatarId: null,
              location: {
                coordinates: [106.7, 10.8],
              },
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles users without coordinates', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-1',
              name: 'Test User',
              avatarId: 'avatar-123',
              location: null,
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Map Focus', () => {
    it('handles map focus on incident', () => {
      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          mapFocusIncidentId: 'incident-123',
          mapFocusUserId: null,
          isMapReady: true,
          actions: {
            setMapFocusIncident: mockSetMapFocusIncident,
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
            setIsMapReady: mockSetIsMapReady,
          },
        };
        return selector ? selector(state) : state;
      });

      mockIncidentsStore.useIncidentsStore.mockImplementation((selector?: any) => {
        const state = {
          incidents: [
            {
              id: 'incident-123',
              name: 'Focused Incident',
              location: {
                coordinates: [106.7, 10.8],
              },
            },
          ],
          isLoading: false,
          error: null,
          actions: {
            fetchIncidents: mockFetchIncidents,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles map focus on user', () => {
      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          mapFocusIncidentId: null,
          mapFocusUserId: 'user-123',
          isMapReady: true,
          actions: {
            setMapFocusIncident: mockSetMapFocusIncident,
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
            setIsMapReady: mockSetIsMapReady,
          },
        };
        return selector ? selector(state) : state;
      });

      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [
            {
              id: 'user-123',
              name: 'Focused User',
              avatarId: 'avatar-123',
              location: {
                coordinates: [106.7, 10.8],
              },
              status: 'available',
            },
          ],
          isLoading: false,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('handles loading state for incidents', () => {
      mockIncidentsStore.useIncidentsStore.mockImplementation((selector?: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          error: null,
          actions: {
            fetchIncidents: mockFetchIncidents,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles loading state for users', () => {
      mockUsersStore.useUsersStore.mockImplementation((selector?: any) => {
        const state = {
          users: [],
          isLoading: true,
          error: null,
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Map Readiness', () => {
    it('handles map ready state', () => {
      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          mapFocusIncidentId: null,
          mapFocusUserId: null,
          isMapReady: true,
          actions: {
            setMapFocusIncident: mockSetMapFocusIncident,
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
            setIsMapReady: mockSetIsMapReady,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles map not ready state', () => {
      mockMapStore.useMapStore.mockImplementation((selector?: any) => {
        const state = {
          mapFocusIncidentId: null,
          mapFocusUserId: null,
          isMapReady: false,
          actions: {
            setMapFocusIncident: mockSetMapFocusIncident,
            setMapFocusUserId: mockSetMapFocusUserId,
            setFlatViewFocusUserId: mockSetFlatViewFocusUserId,
            setIsMapReady: mockSetIsMapReady,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<MapView />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
