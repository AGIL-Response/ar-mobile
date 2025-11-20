// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/tasks');

import { act, renderHook } from '@testing-library/react-native';

import { type Task } from '@/api/tasks/types';

import { useTasksStore } from './index';

import { taskApi } from '@/api';


describe('TasksStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTasksStore.getState().reset?.();
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
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];
      (taskApi.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTasks('tenant-1');
      });

      expect(taskApi.getTasks).toHaveBeenCalledWith('tenant-1');
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
        result.current.actions.fetchTasks('tenant-1');
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
        await result.current.actions.fetchTasks('tenant-1');
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
        await result.current.actions.fetchTasks('tenant-1');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchTask', () => {
    it('successfully fetches a single task', async () => {
      const mockTask = { id: '1', title: 'Task 1' };
      (taskApi.getTask as jest.Mock).mockResolvedValue({ data: mockTask });

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTask('tenant-1', '1');
      });

      expect(taskApi.getTask).toHaveBeenCalledWith('tenant-1', '1');
      expect(result.current.selectedTask).toEqual(mockTask);
      expect(result.current.isLoadingDetail).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Task not found';
      (taskApi.getTask as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTasksStore());

      await act(async () => {
        await result.current.actions.fetchTask('tenant-1', '1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoadingDetail).toBe(false);
    });
  });

  describe('updateTaskStatus', () => {
    it('successfully updates task status and computed properties', async () => {
      const { result } = renderHook(() => useTasksStore());

      act(() => {
        result.current.tasks = [
          { id: '1', name: 'Task 1', status: 'pending' } as Task,
        ];
      });

      (taskApi.updateTask as jest.Mock).mockResolvedValue({});

      await act(async () => {
        await result.current.actions.updateTaskStatus(
          'tenant-1',
          '1',
          'completed'
        );
      });

      expect(taskApi.updateTask).toHaveBeenCalledWith('tenant-1', '1', {
        status: 'completed',
      });
      expect(result.current.tasks[0].status).toBe('completed');
      expect(result.current.completedTasks).toHaveLength(1);
      expect(result.current.pendingTasks).toHaveLength(0);
    });

    it('updates selectedTask if it matches the updated task', async () => {
      const { result } = renderHook(() => useTasksStore());

      const task = { id: '1', name: 'Task 1', status: 'pending' } as Task;

      act(() => {
        result.current.tasks = [task];
        result.current.selectedTask = task;
      });

      (taskApi.updateTask as jest.Mock).mockResolvedValue({});

      await act(async () => {
        await result.current.actions.updateTaskStatus(
          'tenant-1',
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

      await act(async () => {
        await result.current.actions.updateTaskStatus(
          'tenant-1',
          '1',
          'completed'
        );
      });

      expect(result.current.error).toBe(errorMessage);
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
        result.current.selectedTask = { id: '1' } as unknown as Task;
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
        result.current.tasks = [{ id: '1' }] as unknown as Task[];
        result.current.selectedTask = { id: '1' } as unknown as Task;
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
