import React from 'react';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { createIncident } from '@/lib/mock-data-tests';
import IncidentDetailScreen from './detail';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';
import { useMapStore } from '@/stores/map';


jest.mock('@/stores/incidents', () => ({
  useIncidentsStore: jest.fn(),
}));

jest.mock('@/stores/users', () => ({
  useUsersStore: jest.fn(),
}));

jest.mock('@/stores/map', () => ({
  useMapStore: jest.fn(),
}));

// eslint-disable-next-line
const routerModule = require('expo-router');

describe('IncidentDetailScreen', () => {
  const mockFetchIncident = jest.fn();
  const mockSetSelectedIncident = jest.fn();
  const mockSetMapFocusIncident = jest.fn();
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (routerModule.useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'incident-1' });
    (routerModule.useRouter as jest.Mock).mockReturnValue({ back: mockRouterBack });

    // Mock useIncidentsStore with selector support
    (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        selectedIncident: createIncident({
          id: 'incident-1',
          name: 'Test Incident',
          type: 'fire',
          status: 'reported',
          description: 'Test description',
        }),
        isLoadingDetails: false,
        error: null,
        actions: {
          fetchIncident: mockFetchIncident,
          setSelectedIncident: mockSetSelectedIncident,
        },
      };
      return selector ? selector(state) : state;
    });

    // Mock useUsersStore
    (useUsersStore as unknown as jest.Mock).mockReturnValue({
      users: [],
    });

    // Mock useMapStore with selector support
    (useMapStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        actions: {
          setMapFocusIncident: mockSetMapFocusIncident,
        },
      };
      return selector ? selector(state) : state;
    });
  });

  describe('Component Lifecycle', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<IncidentDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('fetches incident on mount', () => {
      render(<IncidentDetailScreen />);
      expect(mockFetchIncident).toHaveBeenCalledWith('incident-1');
    });

    it('clears selected incident on unmount', () => {
      const { unmount } = render(<IncidentDetailScreen />);
      
      unmount();
      
      expect(mockSetSelectedIncident).toHaveBeenCalledWith(null);
    });

    it('does not fetch when id is missing', () => {
      (routerModule.useLocalSearchParams as jest.Mock).mockReturnValue({});
      
      render(<IncidentDetailScreen />);
      
      expect(mockFetchIncident).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading message when isLoadingDetails is true', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: null,
          isLoadingDetails: true,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentDetailScreen />);

      expect(screen.getByText('Loading incident details...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('shows error message when error exists', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: null,
          isLoadingDetails: false,
          error: 'Failed to load incident',
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentDetailScreen />);

      expect(screen.getByText('Failed to load incident')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('shows "Incident not found" when selectedIncident is null', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: null,
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentDetailScreen />);

      expect(screen.getByText('Incident not found')).toBeTruthy();
    });
  });

  describe('Incident Details Rendering', () => {
    it('renders incident name', () => {
      render(<IncidentDetailScreen />);
      expect(screen.getByText('Test Incident')).toBeTruthy();
    });

    it('renders incident description', () => {
      render(<IncidentDetailScreen />);
      expect(screen.getByText('Test description')).toBeTruthy();
    });

    it('renders incident type', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: createIncident({
            id: 'incident-1',
            name: 'Fire Emergency',
            type: 'fire',
            status: 'reported',
          }),
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentDetailScreen />);
      expect(screen.getByText('Fire')).toBeTruthy();
    });

    it('renders incident status', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: createIncident({
            id: 'incident-1',
            name: 'Test',
            type: 'fire',
            status: 'in_progress',
          }),
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentDetailScreen />);
      expect(screen.getByText('In Progress')).toBeTruthy();
    });
  });

  describe('Different Incident Types', () => {
    const testTypes: { type: any; label: string }[] = [
      { type: 'fire', label: 'Fire' },
      { type: 'sos', label: 'Sos' },
      { type: 'intrusion', label: 'Intrusion' },
      { type: 'hazardous_material', label: 'Hazardous Material' },
      { type: 'natural_disaster', label: 'Natural Disaster' },
      { type: 'technical_failure', label: 'Technical Failure' },
      { type: 'other', label: 'Other' },
    ];

    testTypes.forEach(({ type, label }) => {
      it(`renders ${type} incident type correctly`, () => {
        (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
          const state = {
            selectedIncident: createIncident({
              id: 'incident-1',
              name: 'Test',
              type,
              status: 'reported',
            }),
            isLoadingDetails: false,
            error: null,
            actions: {
              fetchIncident: mockFetchIncident,
              setSelectedIncident: mockSetSelectedIncident,
            },
          };
          return selector ? selector(state) : state;
        });

        render(<IncidentDetailScreen />);
        expect(screen.getByText(label)).toBeTruthy();
      });
    });
  });

  describe('Different Incident Statuses', () => {
    const testStatuses: { status: any; label: string }[] = [
      { status: 'reported', label: 'Reported' },
      { status: 'in_progress', label: 'In Progress' },
      { status: 'resolved', label: 'Resolved' },
      { status: 'closed', label: 'Closed' },
      { status: 'acknowledged', label: 'Acknowledged' },
    ];

    testStatuses.forEach(({ status, label }) => {
      it(`renders ${status} status correctly`, () => {
        (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
          const state = {
            selectedIncident: createIncident({
              id: 'incident-1',
              name: 'Test',
              type: 'fire',
              status,
            }),
            isLoadingDetails: false,
            error: null,
            actions: {
              fetchIncident: mockFetchIncident,
              setSelectedIncident: mockSetSelectedIncident,
            },
          };
          return selector ? selector(state) : state;
        });

        render(<IncidentDetailScreen />);
        expect(screen.getByText(label)).toBeTruthy();
      });
    });
  });

  describe('Component Structure', () => {
    it('has AppBar', () => {
      const { root } = render(<IncidentDetailScreen />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });

    it('has ScrollView', () => {
      const { root } = render(<IncidentDetailScreen />);
      const scrollViews = root.findAllByType('ScrollView');
      expect(scrollViews.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles incident without description', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: createIncident({
            id: 'incident-1',
            name: 'Test',
            type: 'fire',
            status: 'reported',
            description: undefined,
          }),
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<IncidentDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles very long incident name', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: createIncident({
            id: 'incident-1',
            name: 'Very Long Incident Name '.repeat(10),
            type: 'fire',
            status: 'reported',
          }),
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<IncidentDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles incident with undefined severity', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedIncident: createIncident({
            id: 'incident-1',
            name: 'Test',
            type: 'fire',
            status: 'reported',
            severity: undefined,
          }),
          isLoadingDetails: false,
          error: null,
          actions: {
            fetchIncident: mockFetchIncident,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON } = render(<IncidentDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
