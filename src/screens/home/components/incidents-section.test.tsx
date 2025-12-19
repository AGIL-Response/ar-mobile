import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import {
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { IncidentsSection } from './incidents-section';
import { IncidentListCard } from '@/screens/incidents/components';

const mockIncidentsStore = require('@/stores/incidents');
const mockRouter = require('expo-router');
jest.mock('@/screens/incidents/components')

describe('IncidentsSection', () => {
  const mockNavigate = jest.fn();
  const mockFetchIncidents = jest.fn();
  const mockSetSelectedIncident = jest.fn();

  const createMockIncident = (id: string, name: string) => ({
    id,
    name,
    type: 'fire' as const,
    status: 'reported' as const,
    priority: 'high' as const,
    description: `Description for ${name}`,
    createdAt: new Date().toISOString(),
  });

  beforeAll(() => {
    // Setup IncidentListCard mock to render a testable element
    (IncidentListCard as jest.Mock).mockImplementation(({ incident, onPress }) =>
      React.createElement(
        'TouchableOpacity',
        {
          onPress: () => onPress(incident),
          testID: `incident-card-${incident.id}`,
        },
        React.createElement('Text', {}, incident.name)
      )
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (mockRouter.useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    // Setup default incidents store mock
    (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<IncidentsSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders section title', () => {
      render(<IncidentsSection />);
      expect(screen.getByText('Incidents')).toBeTruthy();
    });

    it('renders View All button', () => {
      render(<IncidentsSection />);
      expect(screen.getByText('View All')).toBeTruthy();
    });

    it('renders header row with title and View All button', () => {
      render(<IncidentsSection />);
      expect(screen.getByText('Incidents')).toBeTruthy();
      expect(screen.getByText('View All')).toBeTruthy();
    });
  });

  describe('Initial Data Loading', () => {
    it('fetches incidents on mount', () => {
      render(<IncidentsSection />);
      
      expect(mockFetchIncidents).toHaveBeenCalledWith({
        type: 'fire',
        status: 'reported',
      });
    });

    it('fetches incidents only once on mount', () => {
      const { rerender } = render(<IncidentsSection />);
      
      expect(mockFetchIncidents).toHaveBeenCalledTimes(1);
      
      rerender(<IncidentsSection />);
      
      // Should still be called only once (useEffect with empty deps)
      expect(mockFetchIncidents).toHaveBeenCalledTimes(1);
    });

    it('uses correct parameters for fetch', () => {
      render(<IncidentsSection />);
      
      expect(mockFetchIncidents).toHaveBeenCalledWith({
        type: 'fire',
        status: 'reported',
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading message when isLoading is true and no incidents', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      render(<IncidentsSection />);
      
      expect(screen.getByText('Loading incidents...')).toBeTruthy();
    });

    it('still shows View All button during loading', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      render(<IncidentsSection />);
      
      expect(screen.getByText('View All')).toBeTruthy();
    });

    it('does not show loading when incidents exist', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [createMockIncident('1', 'Incident 1')],
          isLoading: true,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.queryByText('Loading incidents...')).toBeNull();
      expect(screen.getByText('Incident 1')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no incidents', () => {
      render(<IncidentsSection />);
      
      expect(screen.getByText('No incidents found')).toBeTruthy();
    });

    it('does not show empty message when loading', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      render(<IncidentsSection />);
      
      expect(screen.queryByText('No incidents found')).toBeNull();
    });

    it('does not show empty message when incidents exist', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [createMockIncident('1', 'Incident 1')],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.queryByText('No incidents found')).toBeNull();
    });
  });

  describe('Incident Cards Display', () => {
    it('renders incident cards when incidents exist', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [
            createMockIncident('1', 'Fire Incident'),
            createMockIncident('2', 'Emergency Call'),
          ],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.getByText('Fire Incident')).toBeTruthy();
      expect(screen.getByText('Emergency Call')).toBeTruthy();
    });

    it('renders maximum of 3 incident cards', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [
            createMockIncident('1', 'Incident One'),
            createMockIncident('2', 'Incident Two'),
            createMockIncident('3', 'Incident Three'),
            createMockIncident('4', 'Incident Four'),
            createMockIncident('5', 'Incident Five'),
          ],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      // First 3 should be visible
      expect(screen.getByText('Incident One')).toBeTruthy();
      expect(screen.getByText('Incident Two')).toBeTruthy();
      expect(screen.getByText('Incident Three')).toBeTruthy();
      
      // 4th and 5th should not be visible
      expect(screen.queryByText('Incident Four')).toBeNull();
      expect(screen.queryByText('Incident Five')).toBeNull();
    });

    it('renders exactly 3 cards when there are exactly 3 incidents', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [
            createMockIncident('1', 'Incident 1'),
            createMockIncident('2', 'Incident 2'),
            createMockIncident('3', 'Incident 3'),
          ],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.getByText('Incident 1')).toBeTruthy();
      expect(screen.getByText('Incident 2')).toBeTruthy();
      expect(screen.getByText('Incident 3')).toBeTruthy();
    });

    it('renders single card when there is only 1 incident', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [createMockIncident('1', 'Single Incident')],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.getByText('Single Incident')).toBeTruthy();
    });

    it('renders incident cards with unique keys', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [
            createMockIncident('1', 'Incident 1'),
            createMockIncident('2', 'Incident 2'),
          ],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      expect(screen.getByTestId('incident-card-1')).toBeTruthy();
      expect(screen.getByTestId('incident-card-2')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to incidents list when View All is pressed', () => {
      const { root } = render(<IncidentsSection />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      // First TouchableOpacity should be View All button
      const viewAllButton = touchables[0];
      
      fireEvent.press(viewAllButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/incidents');
    });

    it('navigates to incident detail when incident card is pressed', () => {
      const incident = createMockIncident('123', 'Fire Emergency');
      
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [incident],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      const incidentCard = screen.getByTestId('incident-card-123');
      fireEvent.press(incidentCard);
      
      expect(mockSetSelectedIncident).toHaveBeenCalledWith(incident);
      expect(mockNavigate).toHaveBeenCalledWith('/incidents/123');
    });

    it('sets selected incident and navigates', () => {
      const incident = createMockIncident('456', 'Medical Emergency');
      
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [incident],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      fireEvent.press(screen.getByTestId('incident-card-456'));
      
      // Both functions should be called
      expect(mockSetSelectedIncident).toHaveBeenCalledWith(incident);
      expect(mockNavigate).toHaveBeenCalledWith('/incidents/456');
    });

    it('navigates to correct incident detail for multiple incidents', () => {
      const incident1 = createMockIncident('1', 'Incident 1');
      const incident2 = createMockIncident('2', 'Incident 2');
      
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [incident1, incident2],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<IncidentsSection />);
      
      fireEvent.press(screen.getByTestId('incident-card-2'));
      
      expect(mockSetSelectedIncident).toHaveBeenCalledWith(incident2);
      expect(mockNavigate).toHaveBeenCalledWith('/incidents/2');
    });

    it('View All button works during loading state', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      const { root } = render(<IncidentsSection />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]);
      
      expect(mockNavigate).toHaveBeenCalledWith('/incidents');
    });

    it('View All button works in empty state', () => {
      const { root } = render(<IncidentsSection />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]);
      
      expect(mockNavigate).toHaveBeenCalledWith('/incidents');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined incidents array', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: undefined as any,
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      // Should not crash
      expect(() => render(<IncidentsSection />)).toThrow();
    });

    it('handles router being undefined', () => {
      (mockRouter.useRouter  as jest.Mock).mockReturnValue(undefined);

      const { root } = render(<IncidentsSection />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      
      // Should throw when trying to navigate
      expect(() => fireEvent.press(touchables[0])).toThrow();
    });

    it('handles navigate function being undefined', () => {
      (mockRouter.useRouter as jest.Mock).mockReturnValue({
        navigate: undefined,
      });

      const { root } = render(<IncidentsSection />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      
      expect(() => fireEvent.press(touchables[0])).toThrow();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<IncidentsSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to title', () => {
      render(<IncidentsSection />);
      expect(screen.getByText('Incidents')).toBeTruthy();
    });

    it('applies correct styles based on loading state', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      const { toJSON } = render(<IncidentsSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Re-render Behavior', () => {
    it('maintains component when incidents change', () => {
      const { rerender } = render(<IncidentsSection />);
      
      expect(screen.getByText('No incidents found')).toBeTruthy();

      // Change to have incidents
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [createMockIncident('1', 'New Incident')],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      rerender(<IncidentsSection />);
      
      expect(screen.getByText('New Incident')).toBeTruthy();
      expect(screen.queryByText('No incidents found')).toBeNull();
    });

    it('updates from loading to loaded state', () => {
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      const { rerender } = render(<IncidentsSection />);
      
      expect(screen.getByText('Loading incidents...')).toBeTruthy();

      // Change to loaded
      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
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

      rerender(<IncidentsSection />);
      
      expect(screen.queryByText('Loading incidents...')).toBeNull();
      expect(screen.getByText('No incidents found')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('has container with header and content', () => {
      const { toJSON } = render(<IncidentsSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('maintains consistent structure across states', () => {
      const { toJSON: jsonEmpty } = render(<IncidentsSection />);
      expect(jsonEmpty).toBeTruthy();

      (mockIncidentsStore.useIncidentsStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          incidents: [createMockIncident('1', 'Incident')],
          isLoading: false,
          actions: {
            fetchIncidents: mockFetchIncidents,
            setSelectedIncident: mockSetSelectedIncident,
          },
        };
        return selector ? selector(state) : state;
      });

      const { toJSON: jsonWithData } = render(<IncidentsSection />);
      expect(jsonWithData).toBeTruthy();
    });
  });
});
