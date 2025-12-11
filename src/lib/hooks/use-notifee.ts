/**
 * useNotifee Hook
 * Centralized notification handling using notifee
 * Handles all notification taps and navigation
 */

import { useEffect } from 'react';
import notifee, {
  AndroidImportance,
  EventType,
  type Event,
} from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import { router } from 'expo-router';
import useAuthStore from '@/stores/auth';

// /**
//  * Lazy getter for auth store to avoid circular dependency
//  */
// function getAuthStore() {
//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   return require('@/stores/auth').default;
// }

interface NotificationMetadata {
  id: string;
  name: string;
  entityType: 'task' | 'incident';
  actor?: {
    id: string;
  };
}

interface NotificationData {
  type: string;
  message: string;
  metadata?: NotificationMetadata | string;
  priority?: string;
  soundFileId?: string;
}

/**
 * Parse notification metadata from string or object
 */
function parseMetadata(
  metadata: NotificationMetadata | string | undefined | any
): NotificationMetadata | null {
  if (!metadata) return null;

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      if (typeof parsed === 'string') {
        return JSON.parse(parsed) as NotificationMetadata;
      }
      return parsed as NotificationMetadata;
    } catch {
      return null;
    }
  }

  if (typeof metadata === 'object' && metadata.id && metadata.entityType) {
    return metadata as NotificationMetadata;
  }

  return null;
}

/**
 * Get navigation destination based on notification type and metadata
 */
function getNavigationDestination(
  type: string,
  metadata: NotificationMetadata | null
): string | null {
  if (!metadata) return null;

  const { entityType, id } = metadata;

  // Task-related notifications
  if (
    type.includes('task') &&
    (entityType === 'task' ||
      type === 'task_assigned' ||
      type === 'task_unassigned' ||
      type === 'task_created' ||
      type === 'task_updated' ||
      type === 'task_deleted' ||
      type === 'task_checklist_updated' ||
      type === 'idle_task_reminder')
  ) {
    return `/task/${id}`;
  }

  // Incident-related notifications
  if (
    type.includes('incident') &&
    (entityType === 'incident' ||
      type === 'incident_created' ||
      type === 'incident_updated' ||
      type === 'incident_assigned' ||
      type === 'incident_unassigned')
  ) {
    return `/incidents/${id}`;
  }

  return null;
}

/**
 * Handle app open event - check for initial notification
 * This should be called once when the app starts to check if it was opened from a notification
 * Checks both Notifee and Firebase initial notifications
 */
export async function handleAppOpenEvent(): Promise<void> {
  try {
    console.log('📱 [handleAppOpenEvent] Checking for initial notification...');
    
    // Check Notifee initial notification first
    const notifeeInitialNotification = await notifee.getInitialNotification();
    
    if (notifeeInitialNotification) {
      console.log('📱 [handleAppOpenEvent] Notifee notification caused application to open', notifeeInitialNotification.notification);
      console.log('📱 [handleAppOpenEvent] Press action used to open the app', notifeeInitialNotification.pressAction);

      const notification = notifeeInitialNotification.notification;
      if (notification?.data) {
        console.log('📱 [handleAppOpenEvent] Processing Notifee initial notification data');
        await handleNotificationTap(notification.data as Record<string, string>);
        return;
      }
    }

    // If Notifee didn't have it, check Firebase's initial notification
    // This handles cases where the app was killed and Firebase showed the notification directly
    const firebaseInitialNotification = await messaging().getInitialNotification();
    
    if (firebaseInitialNotification) {
      console.log('📱 [handleAppOpenEvent] Firebase notification caused application to open');
      console.log('📱 [handleAppOpenEvent] Firebase notification data:', JSON.stringify(firebaseInitialNotification.data, null, 2));

      const data = firebaseInitialNotification.data as unknown as NotificationData;
      
      if (data?.type) {
        // Build notification data in the same format as Notifee uses
        const notificationData: Record<string, string> = {
          type: data.type || '',
          ...(data.metadata && { metadata: typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata) }),
        };
        
        console.log('📱 [handleAppOpenEvent] Processing Firebase initial notification data');
        await handleNotificationTap(notificationData);
        return;
      }
    }

    console.log('📱 [handleAppOpenEvent] No initial notification found from either Notifee or Firebase');
  } catch (error) {
    console.error('📱 [handleAppOpenEvent] Error checking initial notification:', error);
  }
}

/**
 * Handle notification tap and navigate to destination
 * Assumes user is authenticated (called from app layout context)
 */
async function handleNotificationTap(
  notificationData: Record<string, string> | undefined
): Promise<void> {
  try {
    console.log('📱 [handleNotificationTap] Called with data:', JSON.stringify(notificationData, null, 2));

    if (!notificationData) {
      console.warn('📱 [handleNotificationTap] No notification data available');
      return;
    }

    const type = notificationData.type;
    const metadataStr = notificationData.metadata;

    if (!type) {
      console.warn('📱 [handleNotificationTap] No notification type available');
      return;
    }

    // Parse metadata
    let metadata: NotificationMetadata | null = null;
    if (metadataStr) {
      if (typeof metadataStr === 'string') {
        try {
          const parsed = JSON.parse(metadataStr);
          metadata = parseMetadata(parsed);
        } catch {
          metadata = parseMetadata(metadataStr);
        }
      } else {
        metadata = parseMetadata(metadataStr as any);
      }
    }

    const destination = getNavigationDestination(type, metadata);
    console.log('📱 [handleNotificationTap] Navigation destination:', destination);

    if (!destination) {
      console.log('📱 [handleNotificationTap] No navigation destination for notification type:', type);
      return;
    }

    // Check if user is logged in - if not, ignore (shouldn't happen in app layout context)
    const authState = useAuthStore.getState();
    const isLoggedIn = !!authState.token?.accessToken;

    if (!isLoggedIn) {
      console.log('📱 [handleNotificationTap] User not logged in, ignoring notification tap');
      return;
    }

    // Navigate directly - no delays needed since we're in authenticated context
    console.log('📱 [handleNotificationTap] Navigating to:', destination);
    try {
      router.navigate(destination as any);
    } catch (navError) {
      console.error('📱 [handleNotificationTap] Navigation error:', navError);
    }
  } catch (error) {
    console.error('📱 [handleNotificationTap] Error handling notification tap:', error);
  }
}

/**
 * Show local notification with notifee for foreground messages
 */
async function showLocalNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  try {
    const data = (remoteMessage.data as unknown) as NotificationData;
    const notification = remoteMessage.notification;

    if (!notification) {
      console.warn('📱 No notification payload in remote message');
      return;
    }

    // Request permission (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: data.soundFileId || 'default',
    });

    // Parse metadata
    const metadata = parseMetadata(data.metadata);

    // Build notification data for tap handling
    const notificationData: Record<string, string> = {
      type: data.type || '',
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    };

    // Display notification
    await notifee.displayNotification({
      title: notification.title || 'Notification',
      body: notification.body || data.message || '',
      data: notificationData,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: data.soundFileId || 'default',
      },
    });

    console.log('📱 Local notification displayed:', {
      title: notification.title,
      body: notification.body,
      type: data.type,
    });
  } catch (error) {
    console.error('❌ Failed to show local notification:', error);
  }
}

// Register background event handler at module level (REQUIRED by notifee)
// This must be outside React lifecycle - notifee intercepts notification taps
// and Firebase's handlers won't fire for notifications displayed by notifee
let backgroundHandlerRegistered = false;
try {
  notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
    console.log('📱 [notifee.onBackgroundEvent] Event received:', type);
    console.log('📱 [notifee.onBackgroundEvent] Detail:', JSON.stringify(detail, null, 2));

    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      console.log('📱 [notifee.onBackgroundEvent] Notification pressed');
      const notification = detail.notification;

      if (notification?.data) {
        console.log('📱 [notifee.onBackgroundEvent] Calling handleNotificationTap');
        await handleNotificationTap(notification.data as Record<string, string>);
      }
    }
  });
  backgroundHandlerRegistered = true;
  console.log('📱 Background event handler registered at module level');
} catch (error) {
  console.error('📱 Error registering background event handler at module level:', error);
  // Will retry in useEffect if module-level registration fails
}

/**
 * useNotifee Hook
 * Centralized notification handling using notifee
 */
export function useNotifee() {

  // Retry background handler registration if module-level registration failed
  useEffect(() => {
    if (!backgroundHandlerRegistered) {
      console.log('📱 Retrying background event handler registration...');
      try {
        notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
          console.log('📱 [notifee.onBackgroundEvent] Event received:', type);
          if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
            const notification = detail.notification;
            if (notification?.data) {
              await handleNotificationTap(notification.data as Record<string, string>);
            }
          }
        });
        backgroundHandlerRegistered = true;
        console.log('📱 Background event handler registered successfully in useEffect');
      } catch (error) {
        console.error('📱 Error registering background event handler in useEffect:', error);
      }
    }
  }, []);

  // Register foreground event handler
  useEffect(() => {
    console.log('📱 Registering notifee foreground event handler...');

    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }: Event) => {
      console.log('📱 [notifee.onForegroundEvent] Event received:', type);
      console.log('📱 [notifee.onForegroundEvent] Detail:', JSON.stringify(detail, null, 2));

      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        console.log('📱 [notifee.onForegroundEvent] Notification pressed');
        const notification = detail.notification;

        if (notification?.data) {
          console.log('📱 [notifee.onForegroundEvent] Calling handleNotificationTap');
          await handleNotificationTap(notification.data as Record<string, string>);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for Firebase foreground messages and display with notifee
  useEffect(() => {
    console.log('📱 Setting up Firebase foreground message listener...');

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('🔥 Foreground message received:', remoteMessage);
      await showLocalNotification(remoteMessage);
    });

    return () => {
      unsubscribe();
    };
  }, []);
}

