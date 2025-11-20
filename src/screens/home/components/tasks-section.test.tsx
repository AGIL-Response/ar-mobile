import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { TasksSection } from './tasks-section';
import { createTask } from '@/lib/mock-data-tests';

const authStoreModule = require('@/stores/auth');
const tasksStoreModule = require('@/stores/tasks');
const { __pushMock: pushMock } = require('expo-router');

describe('TasksSection', () => {
  let mockTasksState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    authStoreModule.useAuthStore.mockImplementation(() => ({
      selectedTenant: { id: 'tenant-99' },
    }));

    mockTasksState = {
      tasks: [],
      pendingTasks: [],
      isLoading: false,
      actions: {
        fetchTasks: jest.fn(),
        setActiveTab: jest.fn(),
      },
    };

    tasksStoreModule.useTasksStore.mockImplementation(() => mockTasksState);
  });

  it('fetches tasks for the selected tenant on mount', async () => {
    render(<TasksSection />);

    await waitFor(() => {
      expect(mockTasksState.actions.fetchTasks).toHaveBeenCalledWith(
        'tenant-99'
      );
    });
  });

  it('shows a loading message when tasks are being fetched', () => {
    mockTasksState.isLoading = true;

    render(<TasksSection />);

    expect(screen.getByText('Loading tasks...')).toBeTruthy();
  });

  it('shows an empty state when there are no pending tasks', () => {
    render(<TasksSection />);

    expect(screen.getByText('No on-going tasks found')).toBeTruthy();
  });

  it('renders up to three pending tasks', () => {
    mockTasksState.pendingTasks = [
      createTask({ id: '1', name: 'Task One', status: 'pending' }),
      createTask({ id: '2', name: 'Task Two', status: 'pending' }),
      createTask({ id: '3', name: 'Task Three', status: 'pending' }),
      createTask({ id: '4', name: 'Task Four', status: 'pending' }),
    ];

    render(<TasksSection />);

    expect(screen.queryByText('Task Four')).toBeNull();
    expect(screen.getByText('Task One')).toBeTruthy();
    expect(screen.getByText('Task Two')).toBeTruthy();
    expect(screen.getByText('Task Three')).toBeTruthy();
  });

  it('navigates to tasks list when View All is pressed', () => {
    render(<TasksSection />);

    fireEvent.press(findPressableParent(screen.getByText('View All')));

    expect(mockTasksState.actions.setActiveTab).toHaveBeenCalledWith('pending');
    expect(pushMock).toHaveBeenCalledWith('/tasks');
  });

  it('navigates to task detail when a task is pressed', () => {
    mockTasksState.pendingTasks = [
      createTask({ id: '10', name: 'Inspect equipment', status: 'pending' }),
    ];

    render(<TasksSection />);

    fireEvent.press(screen.getByText('Inspect equipment'));

    expect(pushMock).toHaveBeenCalledWith('/task/10');
  });
});
