/**
 * Notifications API
 * API endpoints for notification management
 */

import { apiClient, handleApiError } from '@/api/api-client';
import type {
  MarkNotificationReadRequest,
  MarkNotificationReadResponse,
  NotificationsQueryParams,
  NotificationsResponse,
  NotificationsUnreadCountResponse,
  RegisterFcmTokenRequest,
  RegisterFcmTokenResponse,
} from './types';

export const notificationsApi = {
  /**
   * Get notifications for a user
   */
  getNotifications: async (
    params: NotificationsQueryParams = {}
  ): Promise<NotificationsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      // Set default parameters
      const defaultParams = {
        offset: 0,
        limit: 100,
        sort: '{}',
        count: false,
        ...params,
      };

      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();
      const url = `/notifications${queryString ? `?${queryString}` : ''}`;

      console.log('🚀 Request: GET', url);
      const response = await apiClient.get<NotificationsResponse>(url);
      console.log('✅ Response: GET notifications', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error: GET /notifications', error);
      throw handleApiError(error);
    }
  },

  /**
   * Get unread notifications count for a user
   */
  getUnreadCount: async (
    userId?: string
  ): Promise<NotificationsUnreadCountResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (userId) {
        queryParams.append('userId', userId);
      }

      const queryString = queryParams.toString();
      const url = `/notifications/unread-count${
        queryString ? `?${queryString}` : ''
      }`;

      console.log('🚀 Request: GET', url);
      const response =
        await apiClient.get<NotificationsUnreadCountResponse>(url);
      console.log('✅ Response: GET notifications unread count', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error: GET notifications unread count', error);
      throw handleApiError(error);
    }
  },

  /**
   * Mark notification as read/unread
   */
  markNotificationRead: async (
    data: MarkNotificationReadRequest
  ): Promise<MarkNotificationReadResponse> => {
    try {
      const { notificationId, status } = data;

      console.log('🚀 Request: PATCH /notifications/', notificationId, {
        status,
      });
      const response = await apiClient.patch<MarkNotificationReadResponse>(
        `/notifications/${notificationId}`,
        { status }
      );
      console.log('✅ Response: PATCH notification status', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error: PATCH notification status', error);
      throw handleApiError(error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllNotificationsRead: async (): Promise<void> => {
    try {
      console.log('🚀 Request: PUT /notifications/mark-all-read');
      await apiClient.put(`/notifications/mark-all-read`);
      console.log('✅ Response: PUT mark all notifications read');
    } catch (error) {
      console.error('❌ Error: PUT mark all notifications read', error);
      throw handleApiError(error);
    }
  },

  /**
   * Register FCM token with backend
   */
  registerFcmToken: async (
    data: RegisterFcmTokenRequest
  ): Promise<RegisterFcmTokenResponse> => {
    try {
      console.log('🚀 Request: POST /notifications/tokens', data);
      const response = await apiClient.post<RegisterFcmTokenResponse>(
        '/notifications/tokens',
        data
      );
      console.log('✅ Response: POST /notifications/tokens', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error: POST /notifications/tokens', error);
      throw handleApiError(error);
    }
  },
};

// Re-export types for convenience
export * from './types';
