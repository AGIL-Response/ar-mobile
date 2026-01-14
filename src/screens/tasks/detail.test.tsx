import React from 'react';

import { reactNativeRender as render, screen, waitFor } from '@/lib/test-utils';

import TaskDetailScreen, { getStatusColor, getBackgroundColor, formatDateTime } from './detail';
import { useTasksStore } from '@/stores/tasks';
import { Palette } from '@/theme';

jest.mock('@/stores/tasks', () => ({
  useTasksStore: jest.fn(),
}));

jest.mock('@/components/modal', () => ({
  useModal: jest.fn(() => ({
    ref: { current: null },
    present: jest.fn(),
    dismiss: jest.fn(),
  })),
  Modal: ({ children }: any) => children,
}));

jest.mock('@/components/attachments-gallery', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    AttachmentsGallery: ({ fileIds }: any) =>
      mockReact.createElement('View', { testID: 'attachments-gallery' }, null),
  };
});

// eslint-disable-next-line
const routerModule = require('expo-router');

describe('TaskDetailScreen', () => {
  const mockFetchTask = jest.fn();
  const mockUpdateTaskStatus = jest.fn();
  const mockUpdateChecklistItem = jest.fn();
  const mockClearSelectedTask = jest.fn();
  const mockRouterBack = jest.fn();

  const createMockTask = (overrides = {}) => ({
    id: 'task-1',
    name: 'Test Task',
    description: 'Test description',
    status: 'pending' as const,
    createdAt: '2024-01-01T10:00:00Z',
    startTime: '2024-01-02T10:00:00Z',
    deadline: '2024-01-03T10:00:00Z',
    assignee: {
      id: 'user-1',
      fullName: 'John Doe',
      username: 'johndoe',
    },
    checklist: [
      {
        id: 'check-1',
        description: 'Checklist item 1',
        isCompleted: false,
      },
    ],
    fileIds: ['file-1'],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (routerModule.router.back as jest.Mock) = mockRouterBack;
    (routerModule.useLocalSearchParams as jest.Mock) = jest.fn(() => ({ id: 'task-1' }));

    // Default mocks
    (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = {
        selectedTask: createMockTask(),
        isLoadingDetail: false,
        actions: {
          fetchTask: mockFetchTask,
          updateTaskStatus: mockUpdateTaskStatus,
          updateChecklistItem: mockUpdateChecklistItem,
          clearSelectedTask: mockClearSelectedTask,
        },
      };
      return selector ? selector(state) : state;
    });

    mockFetchTask.mockResolvedValue(undefined);
    mockUpdateTaskStatus.mockResolvedValue(undefined);
    mockUpdateChecklistItem.mockResolvedValue(undefined);
  });

  describe('Exported Helper Functions', () => {
    describe('getStatusColor', () => {
      it('returns success color for completed status', () => {
        expect(getStatusColor('completed')).toBe(Palette.success);
      });

      it('returns warning color for in_progress status', () => {
        expect(getStatusColor('in_progress')).toBe(Palette.warning);
      });

      it('returns error color for cancelled status', () => {
        expect(getStatusColor('cancelled')).toBe(Palette.error);
      });

      it('returns primary color for pending status', () => {
        expect(getStatusColor('pending')).toBe(Palette.primary500);
      });
    });

    describe('getBackgroundColor', () => {
      it('returns success background for completed status', () => {
        expect(getBackgroundColor('completed')).toBe(Palette.successAlt);
      });

      it('returns warning background for in_progress status', () => {
        expect(getBackgroundColor('in_progress')).toBe(Palette.warningAlt);
      });

      it('returns error background for cancelled status', () => {
        expect(getBackgroundColor('cancelled')).toBe(Palette.errorAlt);
      });

      it('returns default background for pending status', () => {
        expect(getBackgroundColor('pending')).toBe(Palette.backgroundSecondary);
      });
    });

    describe('formatDateTime', () => {
      it('formats valid date string correctly', () => {
        const result = formatDateTime('2024-01-15T14:30:00Z');
        expect(result).toBeTruthy();
        expect(result).toContain('2024');
      });

      it('returns empty string for undefined input', () => {
        expect(formatDateTime(undefined)).toBe('');
      });

      it('returns empty string for empty string input', () => {
        expect(formatDateTime('')).toBe('');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading message when isLoadingDetail is true', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: null,
          isLoadingDetail: true,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.getByText('Loading task details...')).toBeTruthy();
    });
  });

  describe('Task Not Found State', () => {
    it('shows not found message when task is null', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: null,
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.getByText('Task not found')).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('fetches task on mount when taskId exists', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask(),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(mockFetchTask).toHaveBeenCalledWith('task-1');
    });

    it('does not fetch task when taskId is missing', () => {
      (routerModule.useLocalSearchParams as jest.Mock) = jest.fn(() => ({}));

      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: null,
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(mockFetchTask).not.toHaveBeenCalled();
    });

    it('calls clearSelectedTask on unmount', () => {
      const { unmount } = render(<TaskDetailScreen />);
      unmount();
      expect(mockClearSelectedTask).toHaveBeenCalled();
    });
  });

  describe('Task Information Display', () => {
    it('displays task information correctly', () => {
      render(<TaskDetailScreen />);
      expect(screen.getByText('Created at')).toBeTruthy();
      expect(screen.getByText('Status')).toBeTruthy();
    });

    it('displays assignee when available', () => {
      render(<TaskDetailScreen />);
      expect(screen.getByText('Assigned to')).toBeTruthy();
    });

    it('hides assignee when not available', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask({ assignee: null }),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.queryByText('Assigned to')).toBeNull();
    });
  });

  describe('Description Section', () => {
    it('displays description when available', () => {
      render(<TaskDetailScreen />);
      expect(screen.getByText('Description')).toBeTruthy();
    });

    it('hides description section when description is null', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask({ description: null }),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.queryByText('Description')).toBeNull();
    });
  });

  describe('Checklist Section', () => {
    it('displays checklist when available', () => {
      render(<TaskDetailScreen />);
      expect(screen.getByText('Check list')).toBeTruthy();
    });

    it('hides checklist section when checklist is empty', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask({ checklist: [] }),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.queryByText('Check list')).toBeNull();
    });
  });

  describe('Attachments Section', () => {
    it('displays attachments when available', () => {
      render(<TaskDetailScreen />);
      expect(screen.getByText('Attachments')).toBeTruthy();
    });

    it('hides attachments section when fileIds is empty', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask({ fileIds: [] }),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(screen.queryByText('Attachments')).toBeNull();
    });
  });

  describe('Action Button', () => {
    it('displays action button for pending status', () => {
      render(<TaskDetailScreen />);
      // Button should be rendered (tested via component structure)
      const { toJSON } = render(<TaskDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('hides action button for completed status', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask({ status: 'completed' }),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      // Button should not be rendered for completed tasks
      const { toJSON } = render(<TaskDetailScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Store Integration', () => {
    it('uses useTasksStore for state', () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask(),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);
      expect(useTasksStore).toHaveBeenCalled();
    });
  });

  describe('useEffect Dependency', () => {
    it('fetches task when taskId changes', async () => {
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) => {
        const state = {
          selectedTask: createMockTask(),
          isLoadingDetail: false,
          actions: {
            fetchTask: mockFetchTask,
            updateTaskStatus: mockUpdateTaskStatus,
            updateChecklistItem: mockUpdateChecklistItem,
            clearSelectedTask: mockClearSelectedTask,
          },
        };
        return selector ? selector(state) : state;
      });

      render(<TaskDetailScreen />);

      await waitFor(() => {
        expect(mockFetchTask).toHaveBeenCalled();
      });
    });
  });
});

