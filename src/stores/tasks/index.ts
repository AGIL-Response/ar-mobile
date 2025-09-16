/**
 * Tasks Store
 * Zustand store for task management
 */

import { taskApi } from '@/api';
import type { Task } from '@/api/tasks/types';
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
    fetchTasks: (tenantId: string) => Promise<void>;
    fetchTask: (tenantId: string, taskId: string) => Promise<void>;
    updateTaskStatus: (
      tenantId: string,
      taskId: string,
      status: Task['status']
    ) => Promise<void>;
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

const tasksStore = (set: any, get: any) => ({
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
    fetchTasks: async (tenantId: string) => {
      set((state: TasksState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await taskApi.getTasks(tenantId);
        set((state: TasksState) => {
          state.tasks = response.data;
          state.isLoading = false;
        });
        // Update computed properties
        get()._updateComputedProperties();
      } catch (error: any) {
        set((state: TasksState) => {
          state.error = error.message || 'Failed to fetch tasks';
          state.isLoading = false;
        });
      }
    },

    fetchTask: async (tenantId: string, taskId: string) => {
      set((state: TasksState) => {
        state.isLoadingDetail = true;
        state.error = null;
      });

      try {
        const response = await taskApi.getTask(tenantId, taskId);
        set((state: TasksState) => {
          state.selectedTask = response.data;
          state.isLoadingDetail = false;
        });
      } catch (error: any) {
        set((state: TasksState) => {
          state.error = error.message || 'Failed to fetch task';
          state.isLoadingDetail = false;
        });
      }
    },

    updateTaskStatus: async (
      tenantId: string,
      taskId: string,
      status: Task['status']
    ) => {
      try {
        await taskApi.updateTask(tenantId, taskId, { status });
        
        set((state: TasksState) => {
          // Update task in list
          const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex].status = status;
          }
          
          // Update selected task if it's the same one
          if (state.selectedTask?.id === taskId) {
            state.selectedTask.status = status;
          }
        });
        
        // Update computed properties
        get()._updateComputedProperties();
      } catch (error: any) {
        set((state: TasksState) => {
          state.error = error.message || 'Failed to update task status';
        });
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
