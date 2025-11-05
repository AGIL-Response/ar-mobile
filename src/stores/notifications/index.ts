/**
 * Notifications Store
 * Zustand store for notifications management
 */

import type { StateCreator } from 'zustand';

import { notificationsApi } from '@/api/notifications';
import type {
  NotificationsQueryParams,
  NotificationStatus,
  UserNotification,
} from '@/api/notifications/types';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

export interface NotificationsState extends IBaseState {
  // State properties
  notifications: UserNotification[];
  isLoading: boolean;
  error: string | null;

  // Actions namespace
  actions: {
    fetchNotifications: (params?: NotificationsQueryParams) => Promise<void>;
    markNotificationRead: (notificationId: string, status: NotificationStatus) => Promise<void>;
    markAllNotificationsRead: (userId: string) => Promise<void>;
    clearError: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<NotificationsState> = {
  notifications: [],
  isLoading: false,
  error: null,
};

const notificationsStore: StateCreator<NotificationsState> = (set, get) => ({
  ...initialState,

  actions: {
    fetchNotifications: async (params?: NotificationsQueryParams) => {
      console.log('Notifications store - fetchNotifications called with params:', params);
      
      set((state: NotificationsState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await notificationsApi.getNotifications(params);
        console.log('Notifications store - API response:', response);
        
        set((state: NotificationsState) => {
          state.notifications = response.data;
          state.isLoading = false;
        });
        
        console.log('Notifications store - notifications updated, count:', response.data.length);
      } catch (error: unknown) {
        console.error('Notifications store - fetch error:', error);
        set((state: NotificationsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to fetch notifications';
          state.isLoading = false;
        });
      }
    },

    markNotificationRead: async (notificationId: string, status: NotificationStatus) => {
      try {
        console.log('Notifications store - marking notification as:', status, notificationId);
        
        await notificationsApi.markNotificationRead({
          notificationId,
          status,
        });

        // Update local state
        set((state: NotificationsState) => {
          const notificationIndex = state.notifications.findIndex(
            (notification) => notification.notificationId === notificationId
          );
          if (notificationIndex !== -1) {
            state.notifications[notificationIndex].status = status;
          }
        });
        
        console.log('Notifications store - notification status updated');
      } catch (error: unknown) {
        console.error('Notifications store - mark read error:', error);
        set((state: NotificationsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to update notification';
        });
      }
    },

    markAllNotificationsRead: async (userId: string) => {
      try {
        console.log('Notifications store - marking all notifications as read for user:', userId);
        
        await notificationsApi.markAllNotificationsRead(userId);

        // Update local state
        set((state: NotificationsState) => {
          state.notifications = state.notifications.map(notification => ({
            ...notification,
            status: 'read' as NotificationStatus,
          }));
        });
        
        console.log('Notifications store - all notifications marked as read');
      } catch (error: unknown) {
        console.error('Notifications store - mark all read error:', error);
        set((state: NotificationsState) => {
          state.error = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
        });
      }
    },

    clearError: () => {
      set((state: NotificationsState) => {
        state.error = null;
      });
    },

    reset: () => resetStore(initialState, set),
  },
});

export const useNotificationsStore = createStore<NotificationsState>(notificationsStore);
