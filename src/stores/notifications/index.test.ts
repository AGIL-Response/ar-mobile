// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/notifications');

// eslint-disable-next-line import/first
import { act, renderHook } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { notificationsApi } from '@/api/notifications';
// eslint-disable-next-line import/first
import {
  createTaskNotification,
  createIncidentNotification,
} from '@/lib/mock-data-tests';

// eslint-disable-next-line import/first
// eslint-disable-next-line @typescript-eslint/no-var-requires
const realNotificationsModule = jest.requireActual('./index') as typeof import('./index');
const useNotificationsStore = realNotificationsModule.useNotificationsStore;

jest.mock('@/api/notifications', () => ({
  notificationsApi: {
    getNotifications: jest.fn(),
    markNotificationRead: jest.fn(),
    markAllNotificationsRead: jest.fn(),
    getUnreadCount: jest.fn(),
  },
}));

describe('NotificationsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    useNotificationsStore.getState().reset?.();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useNotificationsStore());

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchNotifications', () => {
    it('successfully fetches notifications', async () => {
      const mockNotifications = [
        createTaskNotification({
          notificationId: '1',
          type: 'task_assigned',
          message: 'Task assigned',
          status: 'unread',
          createdAt: '2024-01-01',
        }),
        createIncidentNotification({
          notificationId: '2',
          type: 'incident_resolved',
          message: 'Incident resolved',
          status: 'read',
          createdAt: '2024-01-02',
        }),
      ];

      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        data: mockNotifications,
      });

      const { result } = renderHook(() => useNotificationsStore());

      await act(async () => {
        await result.current.actions.fetchNotifications();
      });

      expect(notificationsApi.getNotifications).toHaveBeenCalledWith(undefined);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('fetches notifications with params', async () => {
      const params = { limit: 50, offset: 0 };
      (notificationsApi.getNotifications as jest.Mock).mockResolvedValue({
        data: [],
      });

      const { result } = renderHook(() => useNotificationsStore());

      await act(async () => {
        await result.current.actions.fetchNotifications(params);
      });

      expect(notificationsApi.getNotifications).toHaveBeenCalledWith(params);
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Failed to fetch notifications';
      (notificationsApi.getNotifications as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useNotificationsStore());

      await act(async () => {
        await result.current.actions.fetchNotifications();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.notifications).toEqual([]);
    });

    it('sets loading state during fetch', async () => {
      (notificationsApi.getNotifications as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: [] }), 100);
          })
      );

      const { result } = renderHook(() => useNotificationsStore());

      act(() => {
        result.current.actions.fetchNotifications();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('markNotificationRead', () => {
    it('successfully marks notification as read', async () => {
      const mockNotifications = [
        createTaskNotification({
          notificationId: '1',
          type: 'task_assigned',
          message: 'Task assigned',
          status: 'unread',
          createdAt: '2024-01-01',
          taskId: 'task-1',
          taskName: 'Task 1',
        }),
      ];

      (notificationsApi.markNotificationRead as jest.Mock).mockResolvedValue({});
      (notificationsApi.getUnreadCount as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useNotificationsStore());

      act(() => {
        result.current.notifications = mockNotifications;
      });

      await act(async () => {
        await result.current.actions.markNotificationRead('1', 'read');
      });

      expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith({
        notificationId: '1',
        status: 'read',
      });
      expect(result.current.notifications[0].status).toBe('read');
      // getUnreadCount is called but implementation is commented out, so it may not call the API
      // Just verify the notification was updated
    });

    it('handles mark read error correctly', async () => {
      const errorMessage = 'Failed to update notification';
      (notificationsApi.markNotificationRead as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useNotificationsStore());

      await act(async () => {
        await result.current.actions.markNotificationRead('1', 'read');
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('only updates the specified notification', async () => {
      const mockNotifications = [
        createTaskNotification({
          notificationId: '1',
          type: 'task_assigned',
          message: 'Task 1',
          status: 'unread',
          createdAt: '2024-01-01',
          taskId: 'task-1',
          taskName: 'Task 1',
        }),
        createIncidentNotification({
          notificationId: '2',
          type: 'incident_resolved',
          message: 'Incident 1',
          status: 'unread',
          createdAt: '2024-01-02',
          incidentId: 'incident-1',
          incidentName: 'Incident 1',
        }),
      ];

      (notificationsApi.markNotificationRead as jest.Mock).mockResolvedValue({});
      (notificationsApi.getUnreadCount as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useNotificationsStore());

      act(() => {
        result.current.notifications = mockNotifications;
      });

      await act(async () => {
        await result.current.actions.markNotificationRead('1', 'read');
      });

      expect(result.current.notifications[0].status).toBe('read');
      expect(result.current.notifications[1].status).toBe('unread');
    });
  });

  describe('markAllNotificationsRead', () => {
    it('successfully marks all notifications as read', async () => {
      const mockNotifications = [
        createTaskNotification({
          notificationId: '1',
          type: 'task_assigned',
          message: 'Task 1',
          status: 'unread',
          createdAt: '2024-01-01',
          taskId: 'task-1',
          taskName: 'Task 1',
        }),
        createIncidentNotification({
          notificationId: '2',
          type: 'incident_resolved',
          message: 'Incident 1',
          status: 'unread',
          createdAt: '2024-01-02',
          incidentId: 'incident-1',
          incidentName: 'Incident 1',
        }),
      ];

      (notificationsApi.markAllNotificationsRead as jest.Mock).mockResolvedValue(
        undefined
      );
      (notificationsApi.getUnreadCount as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useNotificationsStore());

      act(() => {
        result.current.notifications = mockNotifications;
      });

      await act(async () => {
        await result.current.actions.markAllNotificationsRead('user-1');
      });

      expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalled();
      expect(result.current.notifications[0].status).toBe('read');
      expect(result.current.notifications[1].status).toBe('read');
      // getUnreadCount is called but implementation is commented out, so it may not actually call the API
      // Just verify the notifications were updated
    });

    it('handles mark all read error correctly', async () => {
      const errorMessage = 'Failed to mark all notifications as read';
      (notificationsApi.markAllNotificationsRead as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useNotificationsStore());

      await act(async () => {
        await result.current.actions.markAllNotificationsRead('user-1');
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('getUnreadCount', () => {
    it('does not throw error', async () => {
      const { result } = renderHook(() => useNotificationsStore());

      // Clear any previous errors
      act(() => {
        result.current.actions.clearError();
      });

      await act(async () => {
        await result.current.actions.getUnreadCount();
      });

      // Should not throw - implementation is currently commented out
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      const { result } = renderHook(() => useNotificationsStore());

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
      const { result } = renderHook(() => useNotificationsStore());

      act(() => {
        result.current.notifications = [
          createTaskNotification({
            notificationId: '1',
            type: 'task_assigned',
            message: 'Task',
            status: 'unread',
            createdAt: '2024-01-01',
            taskId: 'task-1',
            taskName: 'Task',
          }),
        ];
        result.current.unreadCount = 5;
        result.current.error = 'Error';
      });

      act(() => {
        result.current.actions.reset();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
