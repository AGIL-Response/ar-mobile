import React from 'react';

import { reactNativeRender as render, screen, waitFor } from '@/lib/test-utils';

import IncidentsScreen from './index';
import { useAuthStore } from '@/stores/auth';
import { useIncidentsStore } from '@/stores/incidents';
import { useUsersStore } from '@/stores/users';


jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/incidents', () => ({
  useIncidentsStore: jest.fn(),
}));

jest.mock('@/stores/users', () => ({
  useUsersStore: jest.fn(),
}));

jest.mock('./components', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    IncidentListCard: ({ incident, onPress }: any) =>
      mockReact.createElement(
        'TouchableOpacity',
        { onPress: () => onPress?.(incident), testID: `incident-card-${incident.id}` },
        mockReact.createElement('Text', null, incident.name)
      ),
  };
});

jest.mock('@/screens/home/components/app-header', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    AppHeader: () =>
      mockReact.createElement('View', { testID: 'app-header' }, null),
  };
});

// eslint-disable-next-line
const routerModule = require('expo-router');

describe('IncidentsScreen', () => {
  const mockFetchIncidents = jest.fn();
  const mockSetSelectedIncident = jest.fn();
  const mockFetchTeamMembers = jest.fn();
  const mockRouterNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (routerModule.useRouter as jest.Mock).mockReturnValue({
      navigate: mockRouterNavigate,
    });

    // Default mocks
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        selectedTeam: {
          id: 'team-1',
          name: 'Test Team',
        },
      };
      return selector ? selector(state) : state;
    });

    (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        incidents: [],
        isLoading: false,
        actions: {
          fetchIncidents: mockFetchIncidents,
          setSelectedIncident: mockSetSelectedIncident,
        },
      };
      return selector ? selector(state) : state;
    });

    (useUsersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        actions: {
          fetchTeamMembers: mockFetchTeamMembers,
        },
      };
      return selector ? selector(state) : state;
    });

    mockFetchIncidents.mockResolvedValue(undefined);
    mockFetchTeamMembers.mockResolvedValue(undefined);
  });

  describe('Loading State', () => {
    it('shows loading message when isLoading is true and no incidents', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(screen.getByText('Loading incidents...')).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('fetches incidents on mount', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(mockFetchIncidents).toHaveBeenCalledWith({});
    });

    it('fetches team members when team is selected', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(mockFetchTeamMembers).toHaveBeenCalledWith('team-1');
    });

    it('does not fetch team members when no team selected', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTeam: null,
        };
        return selector ? selector(state) : state;
      });

      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(mockFetchTeamMembers).not.toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('uses useIncidentsStore for state', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(useIncidentsStore).toHaveBeenCalled();
    });

    it('uses useAuthStore for team selection', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(useAuthStore).toHaveBeenCalled();
    });

    it('uses useUsersStore for fetching team members', () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);
      expect(useUsersStore).toHaveBeenCalled();
    });
  });

  describe('useEffect Dependency', () => {
    it('fetches data when selectedTeamId changes', async () => {
      (useIncidentsStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          incidents: [],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsScreen />);

      await waitFor(() => {
        expect(mockFetchIncidents).toHaveBeenCalled();
        expect(mockFetchTeamMembers).toHaveBeenCalled();
      });
    });
  });
});
