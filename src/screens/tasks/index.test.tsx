import React from 'react';
import { RefreshControl } from 'react-native';

import {
  act,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import TasksScreen from './index';
import { createAuthState, createTask, createTasksState } from '@/lib/mock-data-tests';
import { AuthState } from '@/stores/auth';
import { TasksState } from '@/stores/tasks';

const { __pushMock: pushMock } = require('expo-router');
const authStoreModule = require('@/stores/auth');
const tasksStoreModule = require('@/stores/tasks');

const fetchTasksMock = jest.fn();
const setActiveTabMock = jest.fn();

let useAuthStoreSpy: jest.SpyInstance<AuthState>;
let useTasksStoreSpy: jest.SpyInstance<TasksState>;
let mockAuthState: AuthState;
let mockTasksState: TasksState;

describe('TasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
    fetchTasksMock.mockClear();
    setActiveTabMock.mockClear();

    mockAuthState = createAuthState({
      selectedTenant: {
        id: 'tenant-1',
        name: 'Tenant 1',
        displayName: 'Tenant 1',
      },
    });

    mockTasksState = createTasksState({
      tasks: [],
      isLoading: false,
      error: null,
      activeTab: 'all',
      actions: {
        fetchTasks: fetchTasksMock,
        setActiveTab: setActiveTabMock,
      },
    });

    useAuthStoreSpy = jest
      .spyOn(authStoreModule, 'useAuthStore')
      .mockReturnValue(mockAuthState);
    useTasksStoreSpy = jest
      .spyOn(tasksStoreModule, 'useTasksStore')
      .mockReturnValue(mockTasksState);
  });

  afterEach(() => {
    useAuthStoreSpy.mockRestore();
    useTasksStoreSpy.mockRestore();
  });

  test('fetches tasks on mount when tenant id is available', async () => {
    render(<TasksScreen />);

    await waitFor(() => {
      expect(fetchTasksMock).toHaveBeenCalledWith('tenant-1');
    });
  });

  test('does not fetch tasks when no tenant is selected', async () => {
    mockAuthState.selectedTenant = null;

    render(<TasksScreen />);

    await waitFor(() => {
      expect(fetchTasksMock).not.toHaveBeenCalled();
    });
  });

  test('shows loading state when tasks are loading', () => {
    mockTasksState.isLoading = true;

    render(<TasksScreen />);

    expect(screen.getByText('Loading tasks...')).toBeTruthy();
  });

  test('shows error message when the store has an error', () => {
    mockTasksState.error = 'Failed to fetch tasks';

    render(<TasksScreen />);

    expect(screen.getByText('Failed to fetch tasks')).toBeTruthy();
  });

  test('shows empty state message when there are no tasks', () => {
    mockTasksState.tasks = [];

    render(<TasksScreen />);

    expect(screen.getByText('No Tasks Yet')).toBeTruthy();
    expect(
      screen.getByText('Tasks will appear here when created')
    ).toBeTruthy();
  });

  test('renders tasks in the all tab and navigates on task press', async () => {
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Pending Task', status: 'pending' }),
      createTask({
        id: 'task-2',
        name: 'Completed Task',
        status: 'completed',
      }),
    ];

    render(<TasksScreen />);

    expect(await screen.findByText('Pending Task')).toBeTruthy();
    expect(screen.getByText('Completed Task')).toBeTruthy();

    fireEvent.press(screen.getByText('Pending Task'));

    expect(pushMock).toHaveBeenCalledWith('/task/task-1');
  });

  test('shows only pending tasks when the pending tab is active', () => {
    mockTasksState.activeTab = 'pending';
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Pending Task', status: 'pending' }),
      createTask({ id: 'task-2', name: 'Completed Task', status: 'completed' }),
    ];

    render(<TasksScreen />);

    expect(screen.getByText('Pending Task')).toBeTruthy();
    expect(screen.queryByText('Completed Task')).toBeNull();
  });

  test('shows message when pending tab has no pending tasks', () => {
    mockTasksState.activeTab = 'pending';
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Completed Task', status: 'completed' }),
    ];

    render(<TasksScreen />);

    expect(screen.getByText('No pending tasks')).toBeTruthy();
  });

  test('shows only completed tasks when the completed tab is active', () => {
    mockTasksState.activeTab = 'completed';
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Pending Task', status: 'pending' }),
      createTask({ id: 'task-2', name: 'Completed Task', status: 'completed' }),
    ];

    render(<TasksScreen />);

    expect(screen.getByText('Completed Task')).toBeTruthy();
    expect(screen.queryByText('Pending Task')).toBeNull();
  });

  test('shows message when completed tab has no completed tasks', () => {
    mockTasksState.activeTab = 'completed';
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Pending Task', status: 'pending' }),
    ];

    render(<TasksScreen />);

    expect(screen.getByText('No completed tasks')).toBeTruthy();
  });

  test('refresh control calls fetchTasks when pulled to refresh', () => {
    mockTasksState.activeTab = 'all';
    mockTasksState.tasks = [
      createTask({ id: 'task-1', name: 'Pending Task', status: 'pending' }),
      createTask({ id: 'task-2', name: 'Completed Task', status: 'completed' }),
    ];

    render(<TasksScreen />);

    fetchTasksMock.mockClear();

    const refreshControl = screen.UNSAFE_getByType(RefreshControl);

    act(() => {
      refreshControl.props.onRefresh();
    });

    expect(fetchTasksMock).toHaveBeenCalledWith('tenant-1');
  });

  test('changes active tab when a tab is pressed', () => {
    render(<TasksScreen />);

    fireEvent.press(screen.getByTestId('tab-pending'));

    expect(setActiveTabMock).toHaveBeenCalledWith('pending');
  });
});
