// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/tasks');

// eslint-disable-next-line import/first
import { act, renderHook } from '@testing-library/react-native';

// eslint-disable-next-line import/first
import { useTasksStore } from './index';

// eslint-disable-next-line import/first
import { taskApi } from '@/api';
// eslint-disable-next-line import/first
import { showErrorMessage } from '@/components/utils';
// eslint-disable-next-line import/first
import { createTask } from '@/lib/mock-data-tests';

jest.mock('@/components/utils', () => ({
  showErrorMessage: jest.fn(),
}));

describe('TasksStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTasksStore.getState().reset?.();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useTasksStore());

      expect(result.current.tasks).toEqual([]);
      expect(result.current.selectedTask).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isLoadingDetail).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.activeTab).toBe('all');
      expect(result.current.pendingTasks).toEqual([]);
      expect(result.current.completedTasks).toEqual([]);
    });
  });

  describe('fetchTasks', () => {
    it('successfully fetches tasks and updates state', async () => {
      const mockTasks = [
        createTask({ id: '1', name: 'Task 1' }),
        createTask({ id: '2', name: 'Task 2' }),
      ];
      (taskApi.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTasks({ teamId: 'team-1' });
      });

      expect(taskApi.getTasks).toHaveBeenCalledWith({ teamId: 'team-1' });
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets loading state during fetch', async () => {
      (taskApi.getTasks as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: [] }), 100);
          })
      );

      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.actions.fetchTasks({ teamId: 'team-1' });
      });

      // Loading should be true immediately
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Network error';
      (taskApi.getTasks as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTasks({ teamId: 'team-1' });
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tasks).toEqual([]);
    });

    it('clears error before fetching', async () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.error = 'Previous error';
      });

      (taskApi.getTasks as jest.Mock).mockResolvedValue({ data: [] });

      await act(async () => {
        await result.current.actions.fetchTasks({ teamId: 'team-1' });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchTask', () => {
    it('successfully fetches a single task', async () => {
      const mockTask = createTask({ id: '1', name: 'Task 1' });
      (taskApi.getTask as jest.Mock).mockResolvedValue({ data: mockTask });

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTask('tenant-1');
      });

      expect(taskApi.getTask).toHaveBeenCalledWith('tenant-1');
      expect(result.current.selectedTask).toEqual(mockTask);
      expect(result.current.isLoadingDetail).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Task not found';
      (taskApi.getTask as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTask('tenant-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoadingDetail).toBe(false);
    });
  });

  describe('updateTaskStatus', () => {
    it('successfully updates task status and computed properties', async () => {
      const { result } = renderHook(() => useTasksStore());

      const mockTask = createTask({
        id: '1',
        name: 'Task 1',
        status: 'pending',
        createdAt: '2024-01-01',
      });

      act(() => {
        useTasksStore.setState({ tasks: [mockTask] });
      });

      (taskApi.updateTask as jest.Mock).mockResolvedValue({});

      await act(async () => {
        await result.current.actions.updateTaskStatus('1', 'completed');
      });

      // The implementation sends all task fields, not just status
      expect(taskApi.updateTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'completed',
          name: 'Task 1',
          updatedAt: expect.any(String),
        })
      );
      expect(result.current.tasks[0].status).toBe('completed');
      expect(result.current.completedTasks).toHaveLength(1);
      expect(result.current.pendingTasks).toHaveLength(0);
    });

    it('updates selectedTask if it matches the updated task', async () => {
      const { result } = renderHook(() => useTasksStore());

      const task = createTask({ id: '1', name: 'Task 1', status: 'pending' });

      act(() => {
        result.current.tasks = [task];
        result.current.selectedTask = task;
      });

      (taskApi.updateTask as jest.Mock).mockResolvedValue({});

      await act(async () => {
        await result.current.actions.updateTaskStatus(
          '1',
          'completed'
        );
      });

      expect(result.current.selectedTask?.status).toBe('completed');
    });

    it('handles update error correctly', async () => {
      const errorMessage = 'Update failed';
      (taskApi.updateTask as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useTasksStore());
      const mockTask = createTask({
        id: '1',
        name: 'Task 1',
        status: 'pending',
        createdAt: '2024-01-01',
      });

      act(() => {
        useTasksStore.setState({ tasks: [mockTask] });
      });

      await act(async () => {
        await result.current.actions.updateTaskStatus('1', 'completed');
      });

      // Implementation uses showErrorMessage instead of setting error state
      expect(showErrorMessage).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('createTask', () => {
    it('successfully creates task and adds to list', async () => {
      const newTask = createTask({ id: 'new-task-1', name: 'New Task' });
      (taskApi.createTask as jest.Mock).mockResolvedValue({ data: newTask });

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        const created = await result.current.actions.createTask({
          name: 'New Task',
          description: 'Task description',
          type: 'investigation',
          priority: 'medium',
          status: 'pending',
          startTime: '2024-01-02T12:00:00.000Z',
          deadline: '2024-01-10T12:00:00.000Z',
        });
        expect(created).toEqual(newTask);
      });

      expect(taskApi.createTask).toHaveBeenCalledWith({
        name: 'New Task',
        description: 'Task description',
        type: 'investigation',
        priority: 'medium',
        status: 'pending',
        startTime: '2024-01-02T12:00:00.000Z',
        deadline: '2024-01-10T12:00:00.000Z',
      });
      expect(result.current.tasks[0]).toEqual(newTask);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets loading state during creation', async () => {
      const newTask = createTask({ id: 'new-task-1', name: 'New Task' });
      (taskApi.createTask as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: newTask }), 100);
          })
      );

      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.actions.createTask({
          name: 'New Task',
          description: 'Task description',
          type: 'investigation',
          priority: 'medium',
          status: 'pending',
        });
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('handles create error correctly', async () => {
      const errorMessage = 'Failed to create task';
      (taskApi.createTask as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        try {
          await result.current.actions.createTask({
            name: 'New Task',
            description: 'Task description',
            type: 'investigation',
            priority: 'medium',
            status: 'pending',
          });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateChecklistItem', () => {
    it('successfully updates checklist item optimistically', async () => {
      const { result } = renderHook(() => useTasksStore());
      const task = createTask({
        id: 'task-1',
        checklist: [
          {
            id: 'checklist-1',
            description: 'Item 1',
            isCompleted: false,
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
        ],
      });

      act(() => {
        useTasksStore.setState({ tasks: [task], selectedTask: task });
      });

      (taskApi.updateChecklistItem as jest.Mock).mockResolvedValue({});
      (taskApi.getTask as jest.Mock).mockResolvedValue({
        data: {
          ...task,
          checklist: [
            {
              id: 'checklist-1',
              description: 'Item 1',
              isCompleted: true,
              updatedAt: '2024-01-02T12:00:00.000Z',
            },
          ],
        },
      });

      await act(async () => {
        await result.current.actions.updateChecklistItem(
          'checklist-1',
          true,
          'Item 1'
        );
      });

      // Optimistic update should have happened immediately
      expect(result.current.tasks[0].checklist?.[0].isCompleted).toBe(true);
      expect(result.current.selectedTask?.checklist?.[0].isCompleted).toBe(
        true
      );
      expect(taskApi.updateChecklistItem).toHaveBeenCalledWith(
        'checklist-1',
        expect.objectContaining({
          isCompleted: true,
          description: 'Item 1',
          updatedAt: '2024-01-01T12:00:00.000Z',
        })
      );
    });

    it('updates checklist item in selected task', async () => {
      const { result } = renderHook(() => useTasksStore());
      const task = createTask({
        id: 'task-1',
        checklist: [
          {
            id: 'checklist-1',
            description: 'Item 1',
            isCompleted: false,
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
        ],
      });

      const updatedTask = {
        ...task,
        checklist: [
          {
            id: 'checklist-1',
            description: 'Item 1',
            isCompleted: true,
            updatedAt: '2024-01-02T12:00:00.000Z',
          },
        ],
      };

      act(() => {
        useTasksStore.setState({ selectedTask: task });
      });

      (taskApi.updateChecklistItem as jest.Mock).mockResolvedValue({});
      (taskApi.getTask as jest.Mock).mockResolvedValue({ data: updatedTask });

      await act(async () => {
        await result.current.actions.updateChecklistItem(
          'checklist-1',
          true,
          'Item 1'
        );
      });

      // After refetch, the task should be updated
      expect(result.current.selectedTask?.checklist?.[0].isCompleted).toBe(
        true
      );
    });

    it('rolls back on error', async () => {
      const { result } = renderHook(() => useTasksStore());
      const task = createTask({
        id: 'task-1',
        checklist: [
          {
            id: 'checklist-1',
            description: 'Item 1',
            isCompleted: false,
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
        ],
      });

      act(() => {
        useTasksStore.setState({ tasks: [task], selectedTask: task });
      });

      const errorMessage = 'Failed to update checklist item';
      (taskApi.updateChecklistItem as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await act(async () => {
        await result.current.actions.updateChecklistItem(
          'checklist-1',
          true,
          'Item 1'
        );
      });

      // Should rollback to original state
      expect(result.current.tasks[0].checklist?.[0].isCompleted).toBe(false);
      expect(result.current.selectedTask?.checklist?.[0].isCompleted).toBe(
        false
      );
      expect(showErrorMessage).toHaveBeenCalledWith(errorMessage);
    });

    it('handles checklist item not found', async () => {
      const { result } = renderHook(() => useTasksStore());
      const task = createTask({
        id: 'task-1',
        checklist: [
          {
            id: 'checklist-1',
            description: 'Item 1',
            isCompleted: false,
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
        ],
      });

      act(() => {
        useTasksStore.setState({ tasks: [task] });
      });

      (taskApi.updateChecklistItem as jest.Mock).mockResolvedValue({});

      await act(async () => {
        await result.current.actions.updateChecklistItem(
          'non-existent',
          true,
          'Item'
        );
      });

      // Should not throw, but also not update anything
      expect(taskApi.updateChecklistItem).toHaveBeenCalled();
    });
  });

  describe('Simple Actions', () => {
    it('setActiveTab updates the active tab', () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.actions.setActiveTab('pending');
      });

      expect(result.current.activeTab).toBe('pending');
    });

    it('clearSelectedTask clears selected task', () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.selectedTask = createTask({ id: '1' });
      });

      act(() => {
        result.current.actions.clearSelectedTask();
      });

      expect(result.current.selectedTask).toBeNull();
    });

    it('clearError clears error state', () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.error = 'Some error';
      });

      act(() => {
        result.current.actions.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.tasks = [createTask({ id: '1' })];
        result.current.selectedTask = createTask({ id: '1' });
        result.current.error = 'Error';
        result.current.activeTab = 'pending';
        result.current.isLoading = true;
      });

      act(() => {
        result.current.reset?.();
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.selectedTask).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.activeTab).toBe('all');
      expect(result.current.isLoading).toBe(false);
    });
  });
});
