/**
 * Tasks Store
 * Zustand store for task management
 */

import type { StateCreator } from 'zustand';

import { taskApi } from '@/api';
import type { CreateTaskRequest, Task, TasksQueryParams } from '@/api/tasks/types';
import { showErrorMessage } from '@/components/utils';
import { TaskTab } from '@/screens/tasks/components/task-tab-selector';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export interface TasksState extends IBaseState {
  // State properties
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  activeTab: TaskTab;

  // Computed properties
  pendingTasks: Task[];
  completedTasks: Task[];

  // Actions namespace
  actions: {
    fetchTasks: (params?: TasksQueryParams) => Promise<void>;
    fetchTask: (taskId: string, silent?: boolean) => Promise<void>;
    createTask: (data: CreateTaskRequest) => Promise<Task>;
    updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
    updateChecklistItem: (checklistId: string, isCompleted: boolean, description: string) => Promise<void>;
    setActiveTab: (tab: TaskTab) => void;
    clearSelectedTask: () => void;
    clearError: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<TasksState> = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  pendingTasks: [],
  completedTasks: [],
  activeTab: 'all',
};

const tasksStore: StateCreator<TasksState> = (set, get) => ({
  ...initialState,

  // Helper function to update computed properties
  _updateComputedProperties: () => {
    const state = get() as TasksState;
    const pendingTasks = state.tasks.filter(
      (task) => !task.status || task.status !== 'completed'
    );
    const completedTasks = state.tasks.filter((task) => task.status === 'completed');
    
    set((newState: TasksState) => {
      newState.pendingTasks = pendingTasks;
      newState.completedTasks = completedTasks;
    });
  },

  actions: {
    fetchTasks: async (params?: TasksQueryParams) => {
      // console.log('Tasks store - fetchTasks called with params:', params);
      
      set((state: TasksState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await taskApi.getTasks(params);
        // console.log('Tasks store - API response:', response);
        
        set((state: TasksState) => {
          state.tasks = response.data;
          state.isLoading = false;
        });
        // Update computed properties
        get()._updateComputedProperties();
        
        // console.log('Tasks store - tasks updated, count:', response.data.length);
      } catch (error: unknown) {
        console.error('Tasks store - fetch error:', error);
        set((state: TasksState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch tasks';
          state.isLoading = false;
        });
      }
    },

    fetchTask: async (taskId: string, silent = false) => {
      if (!silent) {
        set((state: TasksState) => {
          state.isLoadingDetail = true;
          state.error = null;
        });
      }

      try {
        const response = await taskApi.getTask(taskId);
        set((state: TasksState) => {
          state.selectedTask = response.data;
          if (!silent) {
            state.isLoadingDetail = false;
          }
        });
      } catch (error: unknown) {
        if (!silent) {
          set((state: TasksState) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch task';
            state.isLoadingDetail = false;
          });
        } else {
          // Silent fetch failed, just log it without showing error
          console.error('Silent fetch task failed:', error);
        }
      }
    },

    createTask: async (data: CreateTaskRequest) => {
      set((state: TasksState) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const response = await taskApi.createTask(data);
        set((state: TasksState) => {
          state.tasks = [response.data, ...state.tasks];
          state.isLoading = false;
        });
        return response.data;
      } catch (error: unknown) {
        set((state: TasksState) => {
          state.error = error instanceof Error ? error.message : 'Failed to create task';
          state.isLoading = false;
        });
        throw error;
      }
    },

    updateTaskStatus: async (taskId: string, status: Task['status']) => {
      // Find the task to get its current data
      const currentState = get();
      let currentTask: Task | null = null;
      
      // Try to find in selected task first
      if (currentState.selectedTask?.id === taskId) {
        currentTask = currentState.selectedTask;
      } else {
        // Search in tasks list
        currentTask = currentState.tasks.find((task) => task.id === taskId) || null;
      }

      if (!currentTask) {
        showErrorMessage('Task not found');
        return;
      }

      try {
        // Backend only accepts updatedAt and status when starting/completing tasks
        const response = await taskApi.updateTask(taskId, {
          updatedAt: currentTask.updatedAt || new Date().toISOString(),
          status,
        });

        const newUpdatedAt = response?.data?.updatedAt || currentTask?.updatedAt;

        set((state: TasksState) => {
          // Update task in list - only change status, keep other data
          const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex].status = status;
          }
          
          // Update selected task if it's the same one - only change status
          if (state.selectedTask?.id === taskId) {
            state.selectedTask.status = status;
            state.selectedTask.updatedAt = newUpdatedAt;
          }
        });
        
        // Update computed properties
        get()._updateComputedProperties();
      } catch (error: unknown) {
        // Show error toast instead of setting error state
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update task status';
        showErrorMessage(errorMessage);
      }
    },

    updateChecklistItem: async (checklistId: string, isCompleted: boolean, description: string) => {
      // Find the checklist item to get its current updatedAt value
      let currentUpdatedAt: string | null = null;
      const currentState = get();
      
      // Try to find the item in selected task first
      if (currentState.selectedTask?.checklist) {
        const item = currentState.selectedTask.checklist.find(
          (item) => item.id === checklistId
        );
        if (item) {
          currentUpdatedAt = item.updatedAt;
        }
      }
      
      // If not found, search in tasks list
      if (!currentUpdatedAt) {
        for (const task of currentState.tasks) {
          if (task.checklist) {
            const item = task.checklist.find((item) => item.id === checklistId);
            if (item) {
              currentUpdatedAt = item.updatedAt;
              break;
            }
          }
        }
      }

      // Store previous state for rollback (deep copy of checklist items)
      const previousState = {
        selectedTask: get().selectedTask
          ? {
              ...get().selectedTask,
              checklist: get().selectedTask.checklist
                ? get().selectedTask.checklist.map((item) => ({ ...item }))
                : [],
            }
          : null,
        tasks: get().tasks.map((task) => ({
          ...task,
          checklist: task.checklist
            ? task.checklist.map((item) => ({ ...item }))
            : [],
        })),
      };

      // Optimistic update - only change isCompleted, keep other data
      set((state: TasksState) => {
        // Update checklist item in selected task
        if (state.selectedTask?.checklist) {
          const itemIndex = state.selectedTask.checklist.findIndex(
            (item) => item.id === checklistId
          );
          if (itemIndex !== -1) {
            state.selectedTask.checklist[itemIndex].isCompleted = isCompleted;
          }
        }
        
        // Update checklist item in task list
        state.tasks.forEach((task) => {
          if (task.checklist) {
            const itemIndex = task.checklist.findIndex(
              (item) => item.id === checklistId
            );
            if (itemIndex !== -1) {
              task.checklist[itemIndex].isCompleted = isCompleted;
            }
          }
        });
      });

      try {
        await taskApi.updateChecklistItem(checklistId, {
          updatedAt: currentUpdatedAt || new Date().toISOString(),
          description,
          isCompleted,
        });

        // Refetch task to ensure data is in sync with server (silently)
        const currentTask = get().selectedTask;
        if (currentTask?.id) {
          await get().actions.fetchTask(currentTask.id, true);
        }
      } catch (error: unknown) {
        // Rollback to previous state
        set((state: TasksState) => {
          if (previousState.selectedTask) {
            state.selectedTask = previousState.selectedTask;
          }
          state.tasks = previousState.tasks;
        });

        // Show error toast
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update checklist item';
        showErrorMessage(errorMessage);
      }
    },

    clearSelectedTask: () => {
      set((state: TasksState) => {
        state.selectedTask = null;
      });
    },

    clearError: () => {
      set((state: TasksState) => {
        state.error = null;
      });
    },

    setActiveTab: (tab: TaskTab) => {
      set((state: TasksState) => {
        state.activeTab = tab;
      });
    },
  },

  reset: () => resetStore(initialState, set),
});

export const useTasksStore = createStore<TasksState>(tasksStore);
