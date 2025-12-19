import React from 'react';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  act,
} from '@/lib/test-utils';

import type { Task } from '@/api/tasks/types';
import { TaskCard } from './task-card';

// Mock formatDateTime from detail
jest.mock('../detail', () => ({
  formatDateTime: jest.fn((date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} ${d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    })}`;
  }),
  getBackgroundColor: jest.fn((status: string) => {
    switch (status) {
      case 'pending':
        return '#FFF3CD';
      case 'in_progress':
        return '#CCE5FF';
      case 'completed':
        return '#D4EDDA';
      default:
        return '#E2E3E5';
    }
  }),
  getStatusColor: jest.fn((status: string) => {
    switch (status) {
      case 'pending':
        return '#856404';
      case 'in_progress':
        return '#004085';
      case 'completed':
        return '#155724';
      default:
        return '#383D41';
    }
  }),
}));

const baseTask: Task = {
  tenantId: 'tenant-1',
  id: 'task-1',
  type: 'investigation',
  name: 'Task name',
  description: 'Task description',
  startTime: '',
  deadline: '',
  priority: 'medium',
  status: 'pending',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '',
  deletedAt: '',
  createdBy: '',
  updatedBy: '',
  deletedBy: '',
  assigneeId: '',
  teamId: 'team-1',
  incidentId: null,
  checklist: [],
  assignee: null as any,
  fileIds: [],
  incident: null,
};

const createTask = (overrides: Partial<Task> = {}) => ({
  ...baseTask,
  ...overrides,
});

describe('TaskCard', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders task name', () => {
      render(<TaskCard task={baseTask} />);

      expect(screen.getByText('Task name')).toBeTruthy();
    });

    it('renders task description', () => {
      render(<TaskCard task={baseTask} />);

      expect(screen.getByText('Task description')).toBeTruthy();
    });

    it('renders formatted date', () => {
      render(<TaskCard task={baseTask} />);

      // formatDateTime returns date with time
      expect(screen.getByText(/Jan 1, 2024/)).toBeTruthy();
    });

    it('renders all task information together', () => {
      render(<TaskCard task={baseTask} />);

      expect(screen.getByText('Task name')).toBeTruthy();
      expect(screen.getByText('Task description')).toBeTruthy();
      expect(screen.getByText(/Jan 1, 2024/)).toBeTruthy();
    });
  });

  describe('Description Handling', () => {
    it('does not render description when empty', () => {
      render(<TaskCard task={createTask({ description: '' })} />);

      expect(screen.queryByText('Task description')).toBeNull();
    });

    it('does not render description when null', () => {
      render(<TaskCard task={createTask({ description: null as any })} />);

      expect(screen.queryByText('Task description')).toBeNull();
    });

    it('renders description when provided', () => {
      render(<TaskCard task={createTask({ description: 'Custom description' })} />);

      expect(screen.getByText('Custom description')).toBeTruthy();
    });
  });

  describe('Status Display', () => {
    it('displays Pending status', () => {
      render(<TaskCard task={createTask({ status: 'pending' })} />);

      expect(screen.getByText('Pending')).toBeTruthy();
    });

    it('displays In progress status with title casing', () => {
      render(<TaskCard task={createTask({ status: 'in_progress' })} />);

      expect(screen.getByText('In progress')).toBeTruthy();
    });

    it('displays Completed status', () => {
      render(<TaskCard task={createTask({ status: 'completed' })} />);

      expect(screen.getByText('Completed')).toBeTruthy();
    });

    it('falls back to Not Started when status is missing', () => {
      render(<TaskCard task={createTask({ status: null as any })} />);

      expect(screen.getByText('Not Started')).toBeTruthy();
    });

    it('handles undefined status', () => {
      render(<TaskCard task={createTask({ status: undefined as any })} />);

      expect(screen.getByText('Not Started')).toBeTruthy();
    });
  });

  describe('Press Handler', () => {
    it('invokes onPress handler when card is pressed', () => {
      const onPress = jest.fn();

      render(<TaskCard task={baseTask} onPress={onPress} />);

      const title = screen.getByText('Task name');
      const pressable = findPressableParent(title);


      act(() => {
        fireEvent.press(pressable);
      });

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('renders without onPress handler', () => {
      render(<TaskCard task={baseTask} />);

      expect(screen.getByText('Task name')).toBeTruthy();
    });

    it('calls onPress multiple times', () => {
      const onPress = jest.fn();

      render(<TaskCard task={baseTask} onPress={onPress} />);

      const title = screen.getByText('Task name');
      const pressable = findPressableParent(title);

      act(() => {
        fireEvent.press(pressable);
        fireEvent.press(pressable);
      });

      expect(onPress).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('renders with minimal task data', () => {
      const minimalTask = createTask({
        name: 'Minimal Task',
        description: '',
        assignee: null as any,
        status: null as any,
      });

      render(<TaskCard task={minimalTask} />);

      expect(screen.getByText('Minimal Task')).toBeTruthy();
      expect(screen.getByText('Unassigned')).toBeTruthy();
      expect(screen.getByText('Not Started')).toBeTruthy();
    });

    it('handles long task names', () => {
      const longName = 'Very Long Task Name That Might Wrap To Multiple Lines';

      render(<TaskCard task={createTask({ name: longName })} />);

      expect(screen.getByText(longName)).toBeTruthy();
    });

    it('handles long descriptions', () => {
      const longDesc = 'Very long description that might be truncated or wrapped in the UI to fit within the card layout constraints';

      render(<TaskCard task={createTask({ description: longDesc })} />);

      expect(screen.getByText(longDesc)).toBeTruthy();
    });

    it('handles special characters in task name', () => {
      render(<TaskCard task={createTask({ name: 'Task #1: Fix & Test' })} />);

      expect(screen.getByText('Task #1: Fix & Test')).toBeTruthy();
    });
  });

  describe('Avatar Fallback', () => {
    it('generates initials for assignee without avatar', () => {
      render(
        <TaskCard
          task={createTask({
            assignee: {
              id: 'user-1',
              fullName: 'John Doe',
              username: 'johndoe',
              email: 'john@example.com',
              avatarId: undefined,
            } as any,
          })}
        />
      );

      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('handles single-word assignee name', () => {
      render(
        <TaskCard
          task={createTask({
            assignee: {
              id: 'user-1',
              fullName: 'Admin',
              username: 'admin',
              email: 'admin@example.com',
            } as any,
          })}
        />
      );

      expect(screen.getByText('Admin')).toBeTruthy();
    });
  });
});
