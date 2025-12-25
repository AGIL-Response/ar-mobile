import { notificationsApi } from './index';
import { apiClient, handleApiError } from '../api-client';

// Mock dependencies
jest.mock('../api-client');

jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();

describe('notificationsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('successfully gets all notifications with default params', async () => {
      const mockNotifications = {
        data: [
          {
            id: 'notification-1',
            title: 'Notification 1',
            message: 'Test message 1',
            read: false,
          },
          {
            id: 'notification-2',
            title: 'Notification 2',
            message: 'Test message 2',
            read: true,
          },
        ],
        total: 2,
      };

      const mockResponse = {
        data: mockNotifications,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.getNotifications();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/notifications?offset=0&limit=100&sort=%7B%7D&count=false'
      );
      expect(result).toEqual(mockNotifications);
    });

    it('builds query string with custom params', async () => {
      const params = {
        offset: 10,
        limit: 20,
        sort: '{"createdAt":"desc"}',
        count: true,
      };

      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await notificationsApi.getNotifications(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/notifications?')
      );
      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).toContain('limit=20');
      expect(callUrl).toContain('sort=');
      expect(callUrl).toContain('count=true');
    });

    it('excludes undefined and null params from query string', async () => {
      const params = {
        offset: 10,
        limit: undefined,
        count: null as unknown as boolean,
      };

      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await notificationsApi.getNotifications(params);

      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).not.toContain('limit=');
      expect(callUrl).not.toContain('count=');
    });

    it('handles errors', async () => {
      const error = new Error('Failed to get notifications');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get notifications',
        status: 500,
      });

      await expect(notificationsApi.getNotifications()).rejects.toEqual({
        message: 'Failed to get notifications',
        status: 500,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('successfully gets unread count without userId', async () => {
      const mockResponse = {
        data: {
          count: 5,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toEqual(mockResponse.data);
    });

    it('successfully gets unread count with userId', async () => {
      const userId = 'user-1';
      const mockResponse = {
        data: {
          count: 3,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.getUnreadCount(userId);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/notifications/unread-count?userId=user-1'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const error = new Error('Failed to get unread count');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get unread count',
        status: 500,
      });

      await expect(notificationsApi.getUnreadCount()).rejects.toEqual({
        message: 'Failed to get unread count',
        status: 500,
      });
    });
  });

  describe('markNotificationRead', () => {
    it('successfully marks notification as read', async () => {
      const data = {
        notificationId: 'notification-1',
        status: 'read' as const,
      };

      const mockResponse = {
        data: {
          id: 'notification-1',
          read: true,
          status: 'read',
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.markNotificationRead(data);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/notifications/notification-1',
        { status: 'read' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('successfully marks notification as unread', async () => {
      const data = {
        notificationId: 'notification-1',
        status: 'unread' as const,
      };

      const mockResponse = {
        data: {
          id: 'notification-1',
          read: false,
          status: 'unread',
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.markNotificationRead(data);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/notifications/notification-1',
        { status: 'unread' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const data = {
        notificationId: 'notification-1',
        status: 'read' as const,
      };

      const error = new Error('Failed to mark notification as read');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to mark notification as read',
        status: 400,
      });

      await expect(notificationsApi.markNotificationRead(data)).rejects.toEqual({
        message: 'Failed to mark notification as read',
        status: 400,
      });
    });
  });

  describe('markAllNotificationsRead', () => {
    it('successfully marks all notifications as read', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({});

      await notificationsApi.markAllNotificationsRead();

      expect(apiClient.put).toHaveBeenCalledWith(
        '/notifications/mark-all-read'
      );
    });

    it('handles errors', async () => {
      const error = new Error('Failed to mark all notifications as read');
      (apiClient.put as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to mark all notifications as read',
        status: 500,
      });

      await expect(
        notificationsApi.markAllNotificationsRead()
      ).rejects.toEqual({
        message: 'Failed to mark all notifications as read',
        status: 500,
      });
    });
  });

  describe('registerFcmToken', () => {
    it('successfully registers FCM token', async () => {
      const data = {
        token: 'fcm-token-123',
        deviceId: 'device-123',
        platform: 'ios' as const,
        fcmToken: 'fcm-token-123',
        deviceType: 'ios' as const,
      };

      const mockResponse = {
        data: {
          id: 'token-1',
          token: 'fcm-token-123',
          deviceId: 'device-123',
          platform: 'ios',
          deviceType: 'ios',
          fcmToken: 'fcm-token-123',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationsApi.registerFcmToken(data);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/notifications/tokens',
        data
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const data = {
        token: 'fcm-token-123',
        deviceId: 'device-123',
        platform: 'ios' as const,
        fcmToken: 'fcm-token-123',
        deviceType: 'ios' as const,
      };

      const error = new Error('Failed to register FCM token');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to register FCM token',
        status: 400,
      });

      await expect(notificationsApi.registerFcmToken(data)).rejects.toEqual({
        message: 'Failed to register FCM token',
        status: 400,
      });
    });
  });
});

