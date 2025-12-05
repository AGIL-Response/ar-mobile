import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import { notificationsApi } from '@/api/notifications';

/**
 * Lazy getter for auth store to avoid circular dependency
 */
function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/stores/auth').default;
}

export type NotificationPermissionStatus =
  | 'not-determined'
  | 'denied'
  | 'authorized'
  | 'provisional';

export interface NotificationState {
  // Permission status
  permissionStatus: NotificationPermissionStatus | null; // null = not checked yet
  hasPermission: boolean | null; // null = not checked yet, true = granted, false = denied
  isLoading: boolean;
  error: string | null;

  // FCM Token
  fcmToken: string | null;
  isTokenLoading: boolean;
  tokenError: string | null;
}

export interface NotificationCallbacks {
  /** Called when a notification is received while app is in foreground */
  onForegroundMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void;
  /** Called when user taps notification and app opens from background state */
  onNotificationOpenedApp?: (
    message: FirebaseMessagingTypes.RemoteMessage
  ) => void;
  /** Called when app is opened from quit state due to a notification */
  onInitialNotification?: (
    message: FirebaseMessagingTypes.RemoteMessage | null
  ) => void;
  /** Called when FCM token is refreshed */
  onTokenRefresh?: (token: string) => void;
}

export interface NotificationActions {
  /** Initialize notifications - check permission and get token */
  initialize: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<boolean>;
  getFcmToken: () => Promise<string | null>;
  deleteToken: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export interface UseFirebaseNotificationReturn extends NotificationState {
  actions: NotificationActions;
}

export interface UseFirebaseNotificationOptions {
  callbacks?: NotificationCallbacks;
  autoRequestPermission?: boolean; // Default: true
  autoGetToken?: boolean; // Default: true (only if permission granted)
}

export function useFirebaseNotification(
  options: UseFirebaseNotificationOptions = {}
): UseFirebaseNotificationReturn {
  const {
    callbacks = {},
    autoRequestPermission = false,
    autoGetToken = true,
  } = options;

  const [state, setState] = useState<NotificationState>({
    permissionStatus: null,
    hasPermission: null,
    isLoading: false,
    error: null,
    fcmToken: null,
    isTokenLoading: false,
    tokenError: null,
  });

  // Use refs to store callbacks to avoid recreating listeners
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Track last sent token to prevent duplicate sends
  const lastSentTokenRef = useRef<string | null>(null);
  const isSendingRef = useRef(false);

  // Check permission status
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔥 Checking notification permission...');
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let authStatus: number;

      if (Platform.OS === 'ios') {
        authStatus = await messaging().hasPermission();
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ requires explicit permission
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        authStatus = granted
          ? messaging.AuthorizationStatus.AUTHORIZED
          : messaging.AuthorizationStatus.DENIED;
      } else {
        // Android < 13 has notifications enabled by default
        authStatus = messaging.AuthorizationStatus.AUTHORIZED;
      }

      const hasPermission =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const permissionStatus: NotificationPermissionStatus =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED
          ? 'authorized'
          : authStatus === messaging.AuthorizationStatus.PROVISIONAL
            ? 'provisional'
            : authStatus === messaging.AuthorizationStatus.DENIED
              ? 'denied'
              : 'not-determined';

      setState((prev) => ({
        ...prev,
        permissionStatus,
        hasPermission,
        isLoading: false,
      }));

      console.log(`🔥 Permission check result: ${permissionStatus} (hasPermission: ${hasPermission})`);

      // Auto-get token if permission granted and autoGetToken is true
      if (hasPermission && autoGetToken) {
        console.log('🔥 Permission granted, getting FCM token...');
        await getFcmTokenInternal();
      } else if (!hasPermission) {
        console.log('🔥 Permission not granted, skipping token retrieval');
      }

      return hasPermission;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check notification permission';
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        permissionStatus: 'denied',
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [autoGetToken]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔥 Requesting notification permission...');
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let authStatus: number;

      if (Platform.OS === 'ios') {
        authStatus = await messaging().requestPermission({
          alert: true,
          announcement: false,
          badge: true,
          carPlay: false,
          provisional: false,
          sound: true,
        });
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ requires explicit permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message:
              'This app needs notification permission to send you important updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        authStatus =
          granted === PermissionsAndroid.RESULTS.GRANTED
            ? messaging.AuthorizationStatus.AUTHORIZED
            : messaging.AuthorizationStatus.DENIED;
      } else {
        // Android < 13 has notifications enabled by default
        authStatus = messaging.AuthorizationStatus.AUTHORIZED;
      }

      const hasPermission =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const permissionStatus: NotificationPermissionStatus =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED
          ? 'authorized'
          : authStatus === messaging.AuthorizationStatus.PROVISIONAL
            ? 'provisional'
            : authStatus === messaging.AuthorizationStatus.DENIED
              ? 'denied'
              : 'not-determined';

      setState((prev) => ({
        ...prev,
        permissionStatus,
        hasPermission,
        isLoading: false,
      }));

      console.log(`🔥 Permission request result: ${permissionStatus} (hasPermission: ${hasPermission})`);

      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          error: 'Notification permission denied',
        }));

        // Show alert to guide user to settings
        Alert.alert(
          'Notification Permission Required',
          'This app needs notification permission to send you important updates. Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      } else if (autoGetToken) {
        // Auto-get token if permission granted
        await getFcmTokenInternal();
      }

      return hasPermission;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to request notification permission';
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        permissionStatus: 'denied',
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [autoGetToken]);

  // Get FCM token (internal)
  const getFcmTokenInternal = useCallback(async (): Promise<string | null> => {
    try {
      setState((prev) => ({
        ...prev,
        isTokenLoading: true,
        tokenError: null,
      }));

      const token = await messaging().getToken();

      console.log('🔥 FCM Token:', token);

      setState((prev) => ({
        ...prev,
        fcmToken: token,
        isTokenLoading: false,
        tokenError: null,
      }));

      return token;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get FCM token';
      setState((prev) => ({
        ...prev,
        isTokenLoading: false,
        tokenError: errorMessage,
      }));
      return null;
    }
  }, []);

  // Get FCM token (public)
  const getFcmToken = useCallback(async (): Promise<string | null> => {
    if (!state.hasPermission) {
      setState((prev) => ({
        ...prev,
        tokenError: 'Notification permission not granted',
      }));
      return null;
    }
    return await getFcmTokenInternal();
  }, [state.hasPermission, getFcmTokenInternal]);

  // Delete FCM token
  const deleteToken = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        isTokenLoading: true,
        tokenError: null,
      }));

      await messaging().deleteToken();

      setState((prev) => ({
        ...prev,
        fcmToken: null,
        isTokenLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to delete FCM token';
      setState((prev) => ({
        ...prev,
        isTokenLoading: false,
        tokenError: errorMessage,
      }));
    }
  }, []);

  // Refresh FCM token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!state.hasPermission) {
      setState((prev) => ({
        ...prev,
        tokenError: 'Notification permission not granted',
      }));
      return null;
    }

    try {
      // Delete old token first
      await messaging().deleteToken();
      // Get new token
      return await getFcmTokenInternal();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to refresh FCM token';
      setState((prev) => ({
        ...prev,
        tokenError: errorMessage,
      }));
      return null;
    }
  }, [state.hasPermission, getFcmTokenInternal]);

  // Initialize function to setup everything
  const initialize = useCallback(async (): Promise<void> => {
    console.log('🔥 Initializing Firebase Notifications...');
    if (autoRequestPermission) {
      await requestPermission();
    } else {
      await checkPermission();
    }
  }, [autoRequestPermission, checkPermission, requestPermission]);

  // Send FCM token to backend
  const sendFcmTokenToBackend = useCallback(
    async (token: string): Promise<void> => {
      // Prevent duplicate sends of the same token
      if (lastSentTokenRef.current === token || isSendingRef.current) {
        console.log(
          `🔥 Skipping FCM token registration: Already sent or sending (${token.substring(0, 20)}...)`
        );
        return;
      }

      try {
        const authStore = getAuthStore();
        const authState = authStore.getState();
        const accessToken = authState.token?.accessToken;

        // Only send if user is authenticated
        if (!accessToken) {
          console.log(
            '🔥 Skipping FCM token registration: User not authenticated'
          );
          return;
        }

        isSendingRef.current = true;
        const deviceType: 'android' | 'ios' =
          Platform.OS === 'ios' ? 'ios' : 'android';

        console.log(`🔥 Sending FCM token to backend: ${token.substring(0, 20)}...`);
        await notificationsApi.registerFcmToken({
          fcmToken: token,
          deviceType,
        });
        console.log('✅ FCM token successfully registered with backend');
        
        // Mark as sent
        lastSentTokenRef.current = token;
      } catch (error) {
        console.error('❌ Failed to register FCM token with backend:', error);
        // Don't throw - we don't want to break the app if token registration fails
      } finally {
        isSendingRef.current = false;
      }
    },
    []
  );

  // Watch for FCM token changes and send to backend when user is authenticated
  useEffect(() => {
    if (!state.fcmToken) {
      return;
    }

    // Skip if this token was already sent
    if (lastSentTokenRef.current === state.fcmToken) {
      return;
    }

    const authStore = getAuthStore();
    const authState = authStore.getState();
    const accessToken = authState.token?.accessToken;

    // Only send if user is authenticated
    if (accessToken) {
      console.log('🔥 FCM token available and user authenticated, sending to backend...');
      sendFcmTokenToBackend(state.fcmToken);
    } else {
      console.log('🔥 FCM token available but user not authenticated, will send after login');
    }
  }, [state.fcmToken, sendFcmTokenToBackend]);

  // Watch for auth token changes (login) and send FCM token if available
  useEffect(() => {
    const authStore = getAuthStore();
    let previousAccessToken: string | undefined = authStore.getState().token?.accessToken;
    
    // Subscribe to auth store changes - specifically watch for accessToken
    const unsubscribe = authStore.subscribe(
      (authState) => {
        const accessToken = authState.token?.accessToken;
        const fcmToken = state.fcmToken;

        // Only send if:
        // 1. Access token changed from undefined/null to a value (actual login)
        // 2. FCM token exists
        // 3. This FCM token hasn't been sent yet
        if (
          accessToken &&
          !previousAccessToken &&
          fcmToken &&
          lastSentTokenRef.current !== fcmToken
        ) {
          console.log('🔥 User authenticated, sending FCM token to backend...');
          sendFcmTokenToBackend(fcmToken);
        }
        
        previousAccessToken = accessToken;
      },
      (state) => state.token?.accessToken // Only subscribe to accessToken changes
    );

    return unsubscribe;
  }, [state.fcmToken, sendFcmTokenToBackend]);

  // Setup listeners on mount
  useEffect(() => {
    console.log('🔥 useFirebaseNotification hook mounted - initializing...');
    // Check permission status on mount
    if (autoRequestPermission) {
      requestPermission();
    } else {
      checkPermission();
    }

    // Get initial notification (if app was opened from quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('🔥 App opened from quit state via notification:', remoteMessage);
          callbacksRef.current.onInitialNotification?.(remoteMessage);
        } else {
          callbacksRef.current.onInitialNotification?.(null);
        }
      })
      .catch((error) => {
        console.error('🔥 Error getting initial notification:', error);
      });

    // Listen for foreground messages
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        console.log('🔥 Foreground message received:', remoteMessage);
        callbacksRef.current.onForegroundMessage?.(remoteMessage);
      }
    );

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh((token) => {
      console.log('🔥 FCM Token refreshed:', token);
      setState((prev) => ({
        ...prev,
        fcmToken: token,
        tokenError: null,
      }));
      callbacksRef.current.onTokenRefresh?.(token);
      
      // Send refreshed token to backend if user is authenticated
      const authStore = getAuthStore();
      const authState = authStore.getState();
      if (authState.token?.accessToken) {
        sendFcmTokenToBackend(token);
      }
    });

    // Listen for notifications that open app from background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log(
          '🔥 Notification caused app to open from background state:',
          remoteMessage
        );
        callbacksRef.current.onNotificationOpenedApp?.(remoteMessage);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
      unsubscribeNotificationOpened();
    };
  }, [checkPermission, requestPermission, autoRequestPermission, sendFcmTokenToBackend]);

  // Note: Background message handler must be registered outside React lifecycle
  // Call messaging().setBackgroundMessageHandler() in your root index.js file
  // See hook documentation for setup instructions

  return {
    ...state,
    actions: {
      initialize,
      requestPermission,
      checkPermission,
      getFcmToken,
      deleteToken,
      refreshToken,
    },
  };
}

