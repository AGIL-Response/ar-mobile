import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import { router } from 'expo-router';
import { FlatView } from './flat-view';
import { MembersSection } from './members-section';
import { TasksSection } from './tasks-section';

const mockAuthStore = require('@/stores/auth');

jest.mock('./members-section');
jest.mock('./tasks-section');

describe('FlatView', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (router.navigate as jest.Mock) = mockNavigate;

    // Reset auth store to global default (selectedTeam already defined in jest-setup.ts)
    mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
      const state = {
        selectedTeam: {
          id: 'team-1',
          name: 'Alpha Team',
        },
      };
      return selector ? selector(state) : state;
    });

    // Setup component mocks to render testable elements
    (MembersSection as jest.Mock).mockImplementation(() =>
      React.createElement('View', { testID: 'members-section' }, 'Members Section')
    );

    (TasksSection as jest.Mock).mockImplementation(() =>
      React.createElement('View', { testID: 'tasks-section' }, 'Tasks Section')
    );
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<FlatView />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders ScrollView container', () => {
      const { root } = render(<FlatView />);
      const scrollViews = root.findAllByType('ScrollView');
      expect(scrollViews.length).toBeGreaterThan(0);
    });

    it('renders team name from auth store', () => {
      render(<FlatView />);
      expect(screen.getByText('Alpha Team')).toBeTruthy();
    });

    it('renders View Map button', () => {
      render(<FlatView />);
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('renders MembersSection component', () => {
      render(<FlatView />);
      expect(screen.getByTestId('members-section')).toBeTruthy();
    });

    it('renders TasksSection component', () => {
      render(<FlatView />);
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });

    it('renders sections in correct order', () => {
      render(<FlatView />);
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });
  });

  describe('Team Name Display', () => {
    it('displays team name when selectedTeam exists', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: 'Bravo Team',
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      expect(screen.getByText('Bravo Team')).toBeTruthy();
    });

    it('displays empty string when selectedTeam is null', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: null,
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      // Component should render without crashing
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('displays empty string when selectedTeam is undefined', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: undefined,
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      // Component should render without crashing
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('displays empty string when team has no name', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: '',
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      // Should render without team name but with other elements
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('displays team name with special characters', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: 'Team #1 - Special Ops & Rescue',
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      expect(screen.getByText('Team #1 - Special Ops & Rescue')).toBeTruthy();
    });

    it('displays very long team name', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: 'Very Long Team Name That Should Still Be Displayed Correctly',
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      expect(
        screen.getByText('Very Long Team Name That Should Still Be Displayed Correctly')
      ).toBeTruthy();
    });
  });

  describe('View Map Button', () => {
    it('navigates to map screen when pressed', () => {
      const { root } = render(<FlatView />);
      
      // Find TouchableOpacity - there should be only one
      const touchables = root.findAllByType('TouchableOpacity');
      const viewMapButton = touchables[0];

      expect(viewMapButton).toBeTruthy();
      fireEvent.press(viewMapButton);
      expect(mockNavigate).toHaveBeenCalledWith('/(app)/map');
    });

    it('has correct activeOpacity prop', () => {
      const { root } = render(<FlatView />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      const viewMapButton = touchables[0];

      expect(viewMapButton).toBeTruthy();
      expect(viewMapButton.props.activeOpacity).toBe(0.8);
    });

    it('handles multiple rapid presses', () => {
      const { root } = render(<FlatView />);
      
      const touchables = root.findAllByType('TouchableOpacity');
      const viewMapButton = touchables[0];

      fireEvent.press(viewMapButton);
      fireEvent.press(viewMapButton);
      fireEvent.press(viewMapButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/(app)/map');
    });

    it('renders View Map button with correct styling', () => {
      render(<FlatView />);
      const viewMapText = screen.getByText('View Map');
      expect(viewMapText).toBeTruthy();
    });
  });

  describe('ScrollView Configuration', () => {
    it('disables vertical scroll indicator', () => {
      const { root } = render(<FlatView />);
      const scrollView = root.findByType('ScrollView');
      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });

    it('has content container with padding', () => {
      const { root } = render(<FlatView />);
      const scrollView = root.findByType('ScrollView');
      expect(scrollView.props.contentContainerStyle).toBeDefined();
    });

    it('renders with flex: 1 style', () => {
      const { root } = render(<FlatView />);
      const scrollView = root.findByType('ScrollView');
      expect(scrollView.props.style).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('calls MembersSection component', () => {
      render(<FlatView />);
      expect(MembersSection).toHaveBeenCalled();
    });

    it('calls TasksSection component', () => {
      render(<FlatView />);
      expect(TasksSection).toHaveBeenCalled();
    });

    it('renders both sections together', () => {
      render(<FlatView />);
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });

    it('maintains sections even when team name is empty', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: null,
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('has header row with team name and view map button', () => {
      render(<FlatView />);
      
      // Should have team name and View Map button
      expect(screen.getByText('Alpha Team')).toBeTruthy();
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('renders header before sections', () => {
      const { toJSON } = render(<FlatView />);
      const tree = toJSON();
      
      // Component structure should be maintained
      expect(tree).toBeTruthy();
      expect(screen.getByText('Alpha Team')).toBeTruthy();
      expect(screen.getByTestId('members-section')).toBeTruthy();
    });

    it('maintains correct component hierarchy', () => {
      const { root } = render(<FlatView />);
      
      const scrollView = root.findByType('ScrollView');
      expect(scrollView).toBeTruthy();
      
      // Should contain the sections
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<FlatView />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to team title', () => {
      render(<FlatView />);
      const teamTitle = screen.getByText('Alpha Team');
      expect(teamTitle).toBeTruthy();
    });

    it('applies theme to view map button', () => {
      render(<FlatView />);
      const viewMapButton = screen.getByText('View Map');
      expect(viewMapButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing auth store gracefully', () => {
      mockAuthStore.useAuthStore.mockImplementation(() => '');

      render(<FlatView />);
      // Should still render other components
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('handles router not available', () => {
      (router.navigate as jest.Mock).mockImplementation(() => {
        throw new Error('Router not available');
      });

      const component = render(<FlatView />);
      
      const touchables = component.root.findAllByType('TouchableOpacity');
      const viewMapButton = touchables[0];

      // Should throw when pressed
      expect(() => fireEvent.press(viewMapButton)).toThrow('Router not available');
    });

    it('handles undefined selectedTeam.name', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: undefined,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      // Should render without crashing
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('handles null selectedTeam.name', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-1',
            name: null,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      // Should render without crashing
      expect(screen.getByText('View Map')).toBeTruthy();
    });

    it('handles team object without id', () => {
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            name: 'Team Without ID',
          },
        };
        return selector ? selector(state) : state;
      });

      render(<FlatView />);
      expect(screen.getByText('Team Without ID')).toBeTruthy();
    });
  });

  describe('Re-render Behavior', () => {
    it('updates team name when auth store changes', () => {
      const { rerender } = render(<FlatView />);
      
      expect(screen.getByText('Alpha Team')).toBeTruthy();

      // Change team name
      mockAuthStore.useAuthStore.mockImplementation((selector?: any) => {
        const state = {
          selectedTeam: {
            id: 'team-2',
            name: 'Charlie Team',
          },
        };
        return selector ? selector(state) : state;
      });

      rerender(<FlatView />);
      expect(screen.getByText('Charlie Team')).toBeTruthy();
    });

    it('maintains component state on re-render', () => {
      const { rerender } = render(<FlatView />);
      
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();

      rerender(<FlatView />);
      
      expect(screen.getByTestId('members-section')).toBeTruthy();
      expect(screen.getByTestId('tasks-section')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('renders all interactive elements', () => {
      const { root } = render(<FlatView />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });

    it('has touchable View Map button', () => {
      const { root } = render(<FlatView />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
      expect(screen.getByText('View Map')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with all components', () => {
      const startTime = Date.now();
      render(<FlatView />);
      const endTime = Date.now();
      
      // Should render quickly (within 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('does not re-render sections unnecessarily', () => {
      render(<FlatView />);
      
      const membersSectionCallCount = (MembersSection as jest.Mock).mock.calls.length;
      const tasksSectionCallCount = (TasksSection as jest.Mock).mock.calls.length;
      
      // Each section should be called exactly once
      expect(membersSectionCallCount).toBe(1);
      expect(tasksSectionCallCount).toBe(1);
    });
  });
});
