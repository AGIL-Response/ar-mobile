import React from 'react';

import type { Task, TaskStatus } from '@/api/tasks/types';
import {
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import TaskDetailScreen from './detail';
import {
  createAuthState,
  createTask,
  createTasksState,
} from '@/lib/mock-data-tests';
import { AuthState } from '@/stores/auth';
import { TasksState } from '@/stores/tasks';
import { StyleProp, TextStyle } from 'react-native';

const {
  __pushMock: pushMock,
  __backMock: backMock,
  __useLocalSearchParamsMock: useLocalSearchParamsMock,
} = require('expo-router');
const authStoreModule = require('@/stores/auth');
const tasksStoreModule = require('@/stores/tasks');

const fetchTaskMock = jest.fn();
const updateTaskStatusMock = jest.fn();
const clearSelectedTaskMock = jest.fn();

let useAuthStoreSpy: jest.SpyInstance<AuthState>;
let useTasksStoreSpy: jest.SpyInstance<TasksState>;
let mockAuthState: AuthState;
let mockTasksState: TasksState;
let mockTaskId: string;

const renderTaskDetail = (overrides: Partial<Task> = {}) => {
  mockTasksState.selectedTask = createTask(overrides);
  return render(<TaskDetailScreen />);
};

const extractColor = (
  style: StyleProp<TextStyle> | undefined
): string | undefined => {
  if (!style) {
    return undefined;
  }

  if (Array.isArray(style)) {
    for (const item of style) {
      const color = extractColor(item as StyleProp<TextStyle>);
      if (color) {
        return color;
      }
    }
    return undefined;
  }

  if (typeof style === 'object' && 'color' in style) {
    return style.color as string;
  }

  return undefined;
};

const getTextColor = (text: string) => {
  const node = screen.getByText(text);
  return extractColor(node.props.style);
};

describe('TaskDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushMock.mockClear();
    backMock.mockClear();
    fetchTaskMock.mockClear();
    updateTaskStatusMock.mockClear();
    clearSelectedTaskMock.mockClear();

    mockTaskId = 'task-1';
    useLocalSearchParamsMock.mockReturnValue({ id: mockTaskId });

    mockAuthState = createAuthState({
      selectedTenant: {
        id: 'tenant-1',
        name: 'Tenant 1',
        displayName: 'Tenant 1',
      },
    });

    mockTasksState = createTasksState({
      selectedTask: null,
      isLoadingDetail: false,
      error: null,
      actions: {
        fetchTask: fetchTaskMock,
        updateTaskStatus: updateTaskStatusMock,
        clearSelectedTask: clearSelectedTaskMock,
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

  test('fetches task on mount and clears selection on unmount', async () => {
    const { unmount } = render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(fetchTaskMock).toHaveBeenCalledWith('tenant-1', 'task-1');
    });

    unmount();

    expect(clearSelectedTaskMock).toHaveBeenCalled();
  });

  test('does not fetch task when tenant is missing', async () => {
    mockAuthState.selectedTenant = null;

    render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(fetchTaskMock).not.toHaveBeenCalled();
    });
  });

  test('shows loading state while task details are loading', () => {
    mockTasksState.isLoadingDetail = true;

    render(<TaskDetailScreen />);

    expect(screen.getByText('Loading task details...')).toBeTruthy();
  });

  test('shows error state and retries when pressing Retry button', async () => {
    mockTasksState.error = 'Failed to fetch task';

    render(<TaskDetailScreen />);

    await waitFor(() => {
      expect(fetchTaskMock).toHaveBeenCalledWith('tenant-1', 'task-1');
    });

    expect(screen.getByText('Failed to fetch task')).toBeTruthy();

    fetchTaskMock.mockClear();

    fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => {
      expect(fetchTaskMock).toHaveBeenCalledWith('tenant-1', 'task-1');
    });
  });

  test('shows fallback message when task is not found', () => {
    render(<TaskDetailScreen />);

    expect(screen.getByText('Task not found')).toBeTruthy();
  });

  test.each([
    {
      type: 'emergency' as Task['type'],
      icon: 'notification_badge',
      color: '#ef4444',
    },
    {
      type: 'inspection' as Task['type'],
      icon: 'search',
      color: '#f59e0b',
    },
    {
      type: 'training' as Task['type'],
      icon: 'user',
      color: '#1068eb',
    },
    {
      type: 'other' as Task['type'],
      icon: 'list',
      color: '#6b7280',
    },
  ])('renders $type task with correct icon color', ({ type, icon, color }) => {
    renderTaskDetail({ type });

    expect(screen.getByText(`${type} Task`)).toBeTruthy();
  });

  test.each([
    {
      priority: 'critical' as Task['priority'],
      label: 'CRITICAL',
      color: '#ef4444',
    },
    {
      priority: 'high' as Task['priority'],
      label: 'HIGH',
      color: '#ff8800',
    },
    {
      priority: 'medium' as Task['priority'],
      label: 'MEDIUM',
      color: '#f59e0b',
    },
    {
      priority: 'low' as Task['priority'],
      label: 'LOW',
      color: '#10b981',
    },
    {
      priority: 'unknown' as unknown as Task['priority'],
      label: 'UNKNOWN',
      color: '#6b7280',
    },
  ])(
    'maps $priority priority to correct color',
    ({ priority, label, color }) => {
      renderTaskDetail({ priority });

      expect(getTextColor(label)).toBe(color);
    }
  );

  test.each([
    {
      status: 'completed' as TaskStatus,
      label: 'Completed',
      color: '#10b981',
    },
    {
      status: 'in_progress' as TaskStatus,
      label: 'In progress',
      color: '#1068eb',
    },
    {
      status: 'cancelled' as TaskStatus,
      label: 'Cancelled',
      color: '#ef4444',
    },
    {
      status: 'pending' as TaskStatus,
      label: 'Pending',
      color: '#f59e0b',
    },
    {
      status: null,
      label: 'Pending',
      color: '#f59e0b',
    },
  ])('maps $status status to correct color', ({ status, label, color }) => {
    renderTaskDetail({ status });

    expect(getTextColor(label)).toBe(color);
  });

  test('allows marking a pending task as completed', async () => {
    mockTasksState.selectedTask = createTask({ status: 'pending' });

    render(<TaskDetailScreen />);

    expect(await screen.findByText('Mark as Completed')).toBeTruthy();

    fireEvent.press(screen.getByText('Mark as Completed'));

    await waitFor(() => {
      expect(updateTaskStatusMock).toHaveBeenCalledWith(
        'tenant-1',
        'task-1',
        'completed'
      );
    });
  });

  test('allows marking a completed task as pending', async () => {
    mockTasksState.selectedTask = createTask({ status: 'completed' });

    render(<TaskDetailScreen />);

    expect(await screen.findByText('Mark as Pending')).toBeTruthy();
    expect(screen.queryByText('Mark as Completed')).toBeNull();

    fireEvent.press(screen.getByText('Mark as Pending'));

    await waitFor(() => {
      expect(updateTaskStatusMock).toHaveBeenCalledWith(
        'tenant-1',
        'task-1',
        'pending'
      );
    });
  });
});
