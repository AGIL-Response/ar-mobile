import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';
import { useTasksStore } from '@/stores/tasks';

import { TasksSection } from './tasks-section';

jest.mock('@/stores/tasks', () => ({
  useTasksStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

jest.mock('@/screens/tasks/components/task-card');

describe('TasksSection', () => {
  const mockSetActiveTab = jest.fn();
  const mockNavigate = jest.fn();

  // Set up TaskCard mock implementation
  beforeAll(() => {
    const { TaskCard } = jest.requireMock('@/screens/tasks/components/task-card');
    (TaskCard as jest.Mock).mockImplementation(({ task, onPress }: any) =>
      React.createElement(
        'TouchableOpacity',
        { onPress, testID: `task-card-${task.id}` },
        React.createElement('Text', null, task.name)
      )
    );
  });

  const createMockTask = (overrides = {}) => ({
    id: '1',
    name: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        tasks: [],
        pendingTasks: [],
        isLoading: false,
        actions: {
          setActiveTab: mockSetActiveTab,
        },
      })
    );

    const expRouter = jest.requireMock('expo-router');
    (expRouter.useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<TasksSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders title "On-going tasks"', () => {
      render(<TasksSection />);
      expect(screen.getByText('On-going tasks')).toBeTruthy();
    });

    it('renders View All button', () => {
      render(<TasksSection />);
      expect(screen.getByText('View All')).toBeTruthy();
    });

    it('renders header row with title and View All', () => {
      render(<TasksSection />);
      expect(screen.getByText('On-going tasks')).toBeTruthy();
      expect(screen.getByText('View All')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading message when loading and no tasks', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [],
          isLoading: true,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('Loading tasks...')).toBeTruthy();
    });

    it('does not show loading message when tasks exist', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [createMockTask()],
          pendingTasks: [],
          isLoading: true,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.queryByText('Loading tasks...')).toBeNull();
    });

    it('shows View All button even when loading', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [],
          isLoading: true,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('View All')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no pending tasks', () => {
      render(<TasksSection />);

      expect(screen.getByText('No on-going tasks found')).toBeTruthy();
    });

    it('does not show empty message when pending tasks exist', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [createMockTask()],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.queryByText('No on-going tasks found')).toBeNull();
    });
  });

  describe('Task Display', () => {
    it('displays single pending task', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [createMockTask({ id: '1', name: 'Task One' })],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('Task One')).toBeTruthy();
    });

    it('displays up to 3 pending tasks', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [
            createMockTask({ id: '1', name: 'Task One' }),
            createMockTask({ id: '2', name: 'Task Two' }),
            createMockTask({ id: '3', name: 'Task Three' }),
          ],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('Task One')).toBeTruthy();
      expect(screen.getByText('Task Two')).toBeTruthy();
      expect(screen.getByText('Task Three')).toBeTruthy();
    });

    it('displays only first 3 tasks when more than 3 exist', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [
            createMockTask({ id: '1', name: 'Task One' }),
            createMockTask({ id: '2', name: 'Task Two' }),
            createMockTask({ id: '3', name: 'Task Three' }),
            createMockTask({ id: '4', name: 'Task Four' }),
            createMockTask({ id: '5', name: 'Task Five' }),
          ],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('Task One')).toBeTruthy();
      expect(screen.getByText('Task Two')).toBeTruthy();
      expect(screen.getByText('Task Three')).toBeTruthy();
      expect(screen.queryByText('Task Four')).toBeNull();
      expect(screen.queryByText('Task Five')).toBeNull();
    });
  });

  describe('View All Button', () => {
    it('navigates to tasks list when pressed', () => {
      render(<TasksSection />);

      const { root } = render(<TasksSection />);
      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]); // First touchable is View All

      expect(mockSetActiveTab).toHaveBeenCalledWith('pending');
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });

    it('sets active tab to pending before navigation', () => {
      render(<TasksSection />);

      const { root } = render(<TasksSection />);
      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]);

      expect(mockSetActiveTab).toHaveBeenCalledWith('pending');
    });

    it('handles multiple View All presses', () => {
      render(<TasksSection />);

      const { root } = render(<TasksSection />);
      const touchables = root.findAllByType('TouchableOpacity');

      fireEvent.press(touchables[0]);
      fireEvent.press(touchables[0]);
      fireEvent.press(touchables[0]);

      expect(mockSetActiveTab).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Task Press Navigation', () => {
    it('navigates to task detail when task is pressed', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [createMockTask({ id: 'task-123', name: 'Test Task' })],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      fireEvent.press(screen.getByTestId('task-card-task-123'));

      expect(mockNavigate).toHaveBeenCalledWith('/task/task-123');
    });

    it('navigates to correct task detail for each task', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [
            createMockTask({ id: '1', name: 'Task One' }),
            createMockTask({ id: '2', name: 'Task Two' }),
          ],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      fireEvent.press(screen.getByTestId('task-card-1'));
      expect(mockNavigate).toHaveBeenCalledWith('/task/1');

      fireEvent.press(screen.getByTestId('task-card-2'));
      expect(mockNavigate).toHaveBeenCalledWith('/task/2');
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<TasksSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to all text elements', () => {
      render(<TasksSection />);
      expect(screen.getByText('On-going tasks')).toBeTruthy();
      expect(screen.getByText('View All')).toBeTruthy();
      expect(screen.getByText('No on-going tasks found')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty pendingTasks array', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('No on-going tasks found')).toBeTruthy();
    });

    it('handles exactly 3 tasks (boundary case)', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [
            createMockTask({ id: '1', name: 'Task One' }),
            createMockTask({ id: '2', name: 'Task Two' }),
            createMockTask({ id: '3', name: 'Task Three' }),
          ],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      render(<TasksSection />);

      expect(screen.getByText('Task One')).toBeTruthy();
      expect(screen.getByText('Task Two')).toBeTruthy();
      expect(screen.getByText('Task Three')).toBeTruthy();
    });

    it('handles re-render without errors', () => {
      const { rerender } = render(<TasksSection />);

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          tasks: [],
          pendingTasks: [createMockTask()],
          isLoading: false,
          actions: { setActiveTab: mockSetActiveTab },
        })
      );

      rerender(<TasksSection />);

      const { toJSON } = render(<TasksSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent structure', () => {
      const { toJSON } = render(<TasksSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('always shows header with title and View All', () => {
      const states = [
        { tasks: [], pendingTasks: [], isLoading: false },
        { tasks: [], pendingTasks: [], isLoading: true },
        { tasks: [], pendingTasks: [createMockTask()], isLoading: false },
      ];

      states.forEach((state) => {
        (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
          selector({
            ...state,
            actions: { setActiveTab: mockSetActiveTab },
          })
        );

        const { unmount } = render(<TasksSection />);
        expect(screen.getByText('On-going tasks')).toBeTruthy();
        expect(screen.getByText('View All')).toBeTruthy();
        unmount();
      });
    });
  });
});
