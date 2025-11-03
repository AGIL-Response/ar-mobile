import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import type { Task } from '@/api/tasks/types';
import { TaskCard } from './task-card';

const baseTask: Task = {
  tenantId: 'tenant-1',
  id: 'task-1',
  type: 'maintenance',
  name: 'Task name',
  description: 'Task description',
  startTime: null,
  deadline: null,
  priority: 'medium',
  status: 'pending',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  deletedBy: null,
};

const createTask = (overrides: Partial<Task> = {}) => ({
  ...baseTask,
  ...overrides,
});

describe('TaskCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders task information and formatted date', () => {
    const toLocaleSpy = jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockReturnValue('Jan 1, 2024');

    render(<TaskCard task={baseTask} />);

    expect(screen.getByText('Task name')).toBeTruthy();
    expect(screen.getByText('Task description')).toBeTruthy();
    expect(screen.getByText('Jan 1, 2024')).toBeTruthy();

    toLocaleSpy.mockRestore();
  });

  test('invokes onPress handler when card is pressed', () => {
    const onPress = jest.fn();

    render(<TaskCard task={baseTask} onPress={onPress} />);

    const title = screen.getByText('Task name');
    const pressable = findPressableParent(title);

    fireEvent.press(pressable);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not render description when empty', () => {
    render(<TaskCard task={createTask({ description: '' })} />);

    expect(screen.queryByText('Task description')).toBeNull();
  });

  test('formats status labels with title casing', () => {
    render(<TaskCard task={createTask({ status: 'in_progress' })} />);

    expect(screen.getByText('In progress')).toBeTruthy();
  });

  test('falls back to Not Started when status is missing', () => {
    render(<TaskCard task={createTask({ status: null })} />);

    expect(screen.getByText('Not Started')).toBeTruthy();
  });
});
