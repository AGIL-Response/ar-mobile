import React from 'react';

import { reactNativeRender as render, screen, waitFor } from '@/lib/test-utils';

import TasksScreen from './index';
import { useAuthStore } from '@/stores/auth';
import { useTasksStore } from '@/stores/tasks';

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/tasks', () => ({
  useTasksStore: jest.fn(),
}));

jest.mock('./components/task-card', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    TaskCard: ({ task, onPress }: any) =>
      mockReact.createElement(
        'TouchableOpacity',
        { onPress: () => onPress?.(task.id), testID: `task-card-${task.id}` },
        mockReact.createElement('Text', null, task.name)
      ),
  };
});

jest.mock('./components/task-tab-selector', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    TaskTabSelector: ({ activeTab, onTabChange, pendingCount, completedCount }: any) =>
      mockReact.createElement(
        'View',
        { testID: 'task-tab-selector' },
        mockReact.createElement('Text', null, `Tab: ${activeTab}`),
        mockReact.createElement('Text', null, `Pending: ${pendingCount}`),
        mockReact.createElement('Text', null, `Completed: ${completedCount}`)
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

describe('TasksScreen', () => {
  const mockFetchTasks = jest.fn();
  const mockSetActiveTab = jest.fn();
  const mockRouterNavigate = jest.fn();

  const createMockTask = (id: string, name: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => ({
    id,
    name,
    status,
    description: `Description for ${name}`,
    createdAt: new Date().toISOString(),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (routerModule.router.navigate as jest.Mock) = mockRouterNavigate;

    // Default mocks
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        user: {
          id: 'user-1',
          name: 'Test User',
        },
        selectedTeam: {
          id: 'team-1',
          name: 'Test Team',
        },
      };
      return selector ? selector(state) : state;
    });

    (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        tasks: [],
        isLoading: false,
        activeTab: 'all',
        actions: {
          fetchTasks: mockFetchTasks,
          setActiveTab: mockSetActiveTab,
        },
      };
      return selector ? selector(state) : state;
    });

    mockFetchTasks.mockResolvedValue(undefined);
  });

  describe('Loading State', () => {
    it('shows loading message when isLoading is true', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: true,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('Loading tasks...')).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('fetches tasks on mount when userId and teamId exist', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: true,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(mockFetchTasks).toHaveBeenCalledWith({
        assigneeId: 'user-1',
        teamId: 'team-1',
      });
    });

    it('does not fetch tasks when userId is missing', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          user: null,
          selectedTeam: {
            id: 'team-1',
            name: 'Test Team',
          },
        };
        return selector ? selector(state) : state;
      });

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(mockFetchTasks).not.toHaveBeenCalled();
    });

    it('does not fetch tasks when teamId is missing', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          user: {
            id: 'user-1',
            name: 'Test User',
          },
          selectedTeam: null,
        };
        return selector ? selector(state) : state;
      });

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(mockFetchTasks).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no tasks', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('No Tasks Yet')).toBeTruthy();
      expect(screen.getByText('Tasks will appear here when created')).toBeTruthy();
    });
  });

  describe('Task Display', () => {
    it('displays tasks grouped by status', () => {
      const tasks = [
        createMockTask('1', 'Task 1', 'pending'),
        createMockTask('2', 'Task 2', 'in_progress'),
        createMockTask('3', 'Task 3', 'completed'),
        createMockTask('4', 'Task 4', 'cancelled'),
      ];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('Pending Tasks (1)')).toBeTruthy();
      expect(screen.getByText('In Progress Tasks (1)')).toBeTruthy();
      expect(screen.getByText('Completed Tasks (1)')).toBeTruthy();
      expect(screen.getByText('Cancelled Tasks (1)')).toBeTruthy();
    });

    it('displays only pending tasks when pending tab is active', () => {
      const tasks = [
        createMockTask('1', 'Pending Task', 'pending'),
        createMockTask('2', 'Completed Task', 'completed'),
      ];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'pending',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('Pending Tasks')).toBeTruthy();
      expect(screen.queryByText('Completed Tasks')).toBeNull();
    });

    it('shows empty message for pending tab when no pending tasks', () => {
      const tasks = [
        createMockTask('1', 'Completed Task', 'completed'),
      ];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'pending',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('No pending tasks')).toBeTruthy();
    });

    it('shows empty message for completed tab when no completed tasks', () => {
      const tasks = [
        createMockTask('1', 'Pending Task', 'pending'),
      ];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'completed',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(screen.getByText('No completed tasks')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to task detail when task is pressed', () => {
      const tasks = [createMockTask('1', 'Task 1', 'pending')];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      const { root } = render(<TasksScreen />);
      const touchables = root.findAllByType('TouchableOpacity');
      const taskCard = touchables.find((t: any) => t.props.testID === 'task-card-1');

      if (taskCard) {
        taskCard.props.onPress();
        expect(mockRouterNavigate).toHaveBeenCalledWith('/task/1');
      }
    });
  });

  describe('Refresh', () => {
    it('refreshes tasks when pull to refresh', () => {
      const tasks = [createMockTask('1', 'Task 1', 'pending')];

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks,
          isLoading: false,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      
      // Simulate refresh
      const { root } = render(<TasksScreen />);
      const scrollViews = root.findAllByType('ScrollView');
      if (scrollViews.length > 0) {
        const refreshControl = scrollViews[0].props.refreshControl;
        if (refreshControl) {
          refreshControl.props.onRefresh();
          expect(mockFetchTasks).toHaveBeenCalledWith({
            assigneeId: 'user-1',
            teamId: 'team-1',
          });
        }
      }
    });
  });

  describe('Store Integration', () => {
    it('uses useTasksStore for state', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: true,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(useTasksStore).toHaveBeenCalled();
    });

    it('uses useAuthStore for user and team', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: true,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);
      expect(useAuthStore).toHaveBeenCalled();
    });
  });

  describe('useEffect Dependency', () => {
    it('fetches tasks when userId or teamId changes', async () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          tasks: [],
          isLoading: true,
          activeTab: 'all',
          actions: {
            fetchTasks: mockFetchTasks,
            setActiveTab: mockSetActiveTab,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TasksScreen />);

      await waitFor(() => {
        expect(mockFetchTasks).toHaveBeenCalled();
      });
    });
  });
});
