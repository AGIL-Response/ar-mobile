/**
 * Tasks Store
 * Zustand store for task management
 */

import type { StateCreator } from 'zustand';

import { taskApi } from '@/api';
import type { Task, TasksQueryParams } from '@/api/tasks/types';
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
    fetchTask: (taskId: string) => Promise<void>;
    updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
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
      console.log('Tasks store - fetchTasks called with params:', params);
      
      set((state: TasksState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await taskApi.getTasks(params);
        console.log('Tasks store - API response:', response);
        
        set((state: TasksState) => {
          state.tasks = response.data;
          state.isLoading = false;
        });
        // Update computed properties
        get()._updateComputedProperties();
        
        console.log('Tasks store - tasks updated, count:', response.data.length);
      } catch (error: unknown) {
        console.error('Tasks store - fetch error:', error);
        set((state: TasksState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch tasks';
          state.isLoading = false;
        });
      }
    },

    fetchTask: async (taskId: string) => {
      set((state: TasksState) => {
        state.isLoadingDetail = true;
        state.error = null;
      });

      try {
        const response = await taskApi.getTask(taskId);
        set((state: TasksState) => {
          state.selectedTask = response.data;
          state.isLoadingDetail = false;
        });
      } catch (error: unknown) {
        set((state: TasksState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch task';
          state.isLoadingDetail = false;
        });
      }
    },

    updateTaskStatus: async (taskId: string, status: Task['status']) => {
      try {
        await taskApi.updateTask(taskId, { status });
        
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
      } catch (error: unknown) {
        set((state: TasksState) => {
          state.error = error instanceof Error ? error.message : 'Failed to update task status';
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
