// @ts-nocheck
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import { useFirebaseNotification } from './use-firebase-notification';
import { notificationsApi } from '@/api/notifications';

const mockAuthModule = require('@/stores/auth');

// Mock the API
jest.mock('@/api/notifications', () => ({
  __esModule: true,
  notificationsApi: {
    registerFcmToken: jest.fn(),
    getNotifications: jest.fn(),
    markNotificationRead: jest.fn(),
    markAllNotificationsRead: jest.fn(),
    getUnreadCount: jest.fn(),
  },
}));


// Store original Platform.OS
const originalPlatformOS = Platform.OS;
const originalPlatformVersion = Platform.Version;

describe('useFirebaseNotification', () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Reset Platform
    Platform.OS = originalPlatformOS;
    Platform.Version = originalPlatformVersion;

    // Reset auth store mock
    mockAuthModule.default.getState.mockReturnValue({
      token: { accessToken: 'test-access-token' },
      user: { id: 'user-1' },
    });

    mockAuthModule.default.subscribe = jest.fn(() => jest.fn());

    // Reset messaging mocks
    const messagingInstance = messaging();
    messagingInstance.hasPermission.mockResolvedValue(
      messaging.AuthorizationStatus.AUTHORIZED
    );
    messagingInstance.requestPermission.mockResolvedValue(
      messaging.AuthorizationStatus.AUTHORIZED
    );
    messagingInstance.getToken.mockResolvedValue('test-token');
    messagingInstance.deleteToken.mockResolvedValue(undefined);
    messagingInstance.onMessage.mockReturnValue(jest.fn());
    messagingInstance.onTokenRefresh.mockReturnValue(jest.fn());
    messagingInstance.onNotificationOpenedApp.mockReturnValue(jest.fn());

    // Mock PermissionsAndroid
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
      PermissionsAndroid.RESULTS.GRANTED
    );

    // Mock Alert
    (Alert.alert as jest.Mock) = jest.fn();

    // Mock Linking
    (Linking.openSettings as jest.Mock) = jest.fn();

    // Mock notificationsApi
    (notificationsApi.registerFcmToken as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    Platform.OS = originalPlatformOS;
    Platform.Version = originalPlatformVersion;
  });

  describe('Initial State', () => {
    it('initializes with correct default values', async () => {
      const messagingInstance = messaging();
      // Prevent auto-initialization from fetching token
      messagingInstance.getToken.mockResolvedValue('test-token');
      
      const { result } = renderHook(() => useFirebaseNotification());

      // Check initial values before auto-initialization completes
      expect(result.current.actions).toBeDefined();
      
      // Wait for auto-initialization
      await waitFor(() => {
        expect(result.current.permissionStatus).not.toBe(null);
      });
    });

    it('exposes all required actions', async () => {
      const { result } = renderHook(() => useFirebaseNotification());

      expect(result.current.actions).toHaveProperty('initialize');
      expect(result.current.actions).toHaveProperty('requestPermission');
      expect(result.current.actions).toHaveProperty('checkPermission');
      expect(result.current.actions).toHaveProperty('getFcmToken');
      expect(result.current.actions).toHaveProperty('deleteToken');
      expect(result.current.actions).toHaveProperty('refreshToken');
    });
  });

  describe('Permission Checking - iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('checks permission on mount', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.hasPermission).toHaveBeenCalled();
      });
    });

    it('sets hasPermission to true when authorized', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('test-token');

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.permissionStatus).toBe('authorized');
      });
    });

    it('sets hasPermission to true when provisional', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.PROVISIONAL
      );

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: false })
      );

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.permissionStatus).toBe('provisional');
      });
    });

    it('sets hasPermission to false when denied', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.permissionStatus).toBe('denied');
      });
    });

    it('sets permissionStatus to not-determined', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.NOT_DETERMINED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.permissionStatus).toBe('not-determined');
      });
    });

    it('auto-gets token when permission is granted and autoGetToken is true', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('auto-token');

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: true })
      );

      await waitFor(() => {
        expect(messagingInstance.getToken).toHaveBeenCalled();
        expect(result.current.fcmToken).toBe('auto-token');
      });
    });

    it('skips token retrieval when autoGetToken is false', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: false })
      );

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      expect(messagingInstance.getToken).not.toHaveBeenCalled();
    });

    it('handles permission check error', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockRejectedValue(
        new Error('Permission check failed')
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.error).toBe('Permission check failed');
        expect(result.current.permissionStatus).toBe('denied');
      });
    });
  });

  describe('Permission Checking - Android 13+', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      Platform.Version = 33;
    });

    it('checks POST_NOTIFICATIONS permission', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(PermissionsAndroid.check).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      });
    });

    it('sets hasPermission based on POST_NOTIFICATIONS permission', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const messagingInstance = messaging();
      messagingInstance.getToken.mockResolvedValue('android-token');

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.permissionStatus).toBe('authorized');
      });
    });

    it('sets hasPermission to false when permission denied', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
        expect(result.current.permissionStatus).toBe('denied');
      });
    });
  });

  describe('Permission Checking - Android <13', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      Platform.Version = 32;
    });

    it('grants permission by default', async () => {
      const messagingInstance = messaging();
      messagingInstance.getToken.mockResolvedValue('android-old-token');

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
        expect(result.current.permissionStatus).toBe('authorized');
      });

      expect(PermissionsAndroid.check).not.toHaveBeenCalled();
    });
  });

  describe('Permission Requesting - iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('requests permission with correct options', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      expect(messagingInstance.requestPermission).toHaveBeenCalledWith({
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        provisional: false,
        sound: true,
      });
    });

    it('returns true when permission granted', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('granted-token');

      const { result } = renderHook(() => useFirebaseNotification());

      let permissionGranted;
      await act(async () => {
        permissionGranted = await result.current.actions.requestPermission();
      });

      expect(permissionGranted).toBe(true);
      expect(result.current.hasPermission).toBe(true);
    });

    it('returns false when permission denied', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      let permissionGranted;
      await act(async () => {
        permissionGranted = await result.current.actions.requestPermission();
      });

      expect(permissionGranted).toBe(false);
      expect(result.current.hasPermission).toBe(false);
    });

    it('shows alert and opens settings when permission denied', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Notification Permission Required',
        'This app needs notification permission to send you important updates. Please enable notifications in your device settings.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Open Settings' }),
        ])
      );
    });

    it('auto-gets token when permission granted and autoGetToken is true', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('request-token');

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: true })
      );

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.fcmToken).toBe('request-token');
      });
    });

    it('handles permission request error', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockRejectedValue(
        new Error('Request failed')
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      expect(result.current.hasPermission).toBe(false);
      expect(result.current.error).toBe('Request failed');
    });
  });

  describe('Permission Requesting - Android 13+', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      Platform.Version = 33;
    });

    it('requests POST_NOTIFICATIONS permission', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.GRANTED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await act(async () => {
        await result.current.actions.requestPermission();
      });

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        expect.objectContaining({
          title: 'Notification Permission',
        })
      );
    });

    it('returns true when permission granted', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.GRANTED
      );
      const messagingInstance = messaging();
      messagingInstance.getToken.mockResolvedValue('android-granted-token');

      const { result } = renderHook(() => useFirebaseNotification());

      let permissionGranted;
      await act(async () => {
        permissionGranted = await result.current.actions.requestPermission();
      });

      expect(permissionGranted).toBe(true);
    });

    it('returns false when permission denied', async () => {
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      let permissionGranted;
      await act(async () => {
        permissionGranted = await result.current.actions.requestPermission();
      });

      expect(permissionGranted).toBe(false);
    });
  });

  describe('FCM Token Operations', () => {
    it('gets FCM token when permission granted', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('manual-token');

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: false })
      );

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      let token;
      await act(async () => {
        token = await result.current.actions.getFcmToken();
      });

      expect(token).toBe('manual-token');
      expect(result.current.fcmToken).toBe('manual-token');
    });

    it('returns null when permission not granted', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let token;
      await act(async () => {
        token = await result.current.actions.getFcmToken();
      });

      expect(token).toBe(null);
      expect(result.current.tokenError).toBe('Notification permission not granted');
    });

    it('handles token retrieval error', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockRejectedValue(new Error('Token error'));

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoGetToken: false })
      );

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.getFcmToken();
      });

      expect(result.current.fcmToken).toBe(null);
      expect(result.current.tokenError).toBe('Token error');
    });

    it('deletes FCM token', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('token-to-delete');

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.fcmToken).toBe('token-to-delete');
      });

      await act(async () => {
        await result.current.actions.deleteToken();
      });

      expect(messagingInstance.deleteToken).toHaveBeenCalled();
      expect(result.current.fcmToken).toBe(null);
    });

    it('handles delete token error', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.deleteToken.mockRejectedValue(new Error('Delete error'));

      const { result, unmount } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(true);
      });

      await act(async () => {
        await result.current.actions.deleteToken();
      });

      await waitFor(() => {
        expect(result.current.tokenError).toBe('Delete error');
      });
      
      unmount();
    });

    it('refreshes FCM token', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('new-token');

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.fcmToken).toBe('old-token');
      });

      let newToken;
      await act(async () => {
        newToken = await result.current.actions.refreshToken();
      });

      expect(messagingInstance.deleteToken).toHaveBeenCalled();
      expect(newToken).toBe('new-token');
      expect(result.current.fcmToken).toBe('new-token');
    });

    it('returns null when refreshing without permission', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.DENIED
      );

      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.hasPermission).toBe(false);
      });

      let newToken;
      await act(async () => {
        newToken = await result.current.actions.refreshToken();
      });

      expect(newToken).toBe(null);
      expect(result.current.tokenError).toBe('Notification permission not granted');
    });
  });

  describe('Initialize Action', () => {
    it('calls checkPermission when autoRequestPermission is false', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoRequestPermission: false })
      );

      await act(async () => {
        await result.current.actions.initialize();
      });

      expect(messagingInstance.hasPermission).toHaveBeenCalled();
    });

    it('calls requestPermission when autoRequestPermission is true', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result } = renderHook(() =>
        useFirebaseNotification({ autoRequestPermission: true })
      );

      await act(async () => {
        await result.current.actions.initialize();
      });

      expect(messagingInstance.requestPermission).toHaveBeenCalled();
    });
  });

  describe('Message Listeners', () => {
    it('sets up onMessage listener', async () => {
      const messagingInstance = messaging();
      
      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.onMessage).toHaveBeenCalled();
      });
    });

    it('calls onForegroundMessage callback when message received', async () => {
      const onForegroundMessage = jest.fn();
      const messagingInstance = messaging();
      
      let messageHandler;
      messagingInstance.onMessage.mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseNotification({ callbacks: { onForegroundMessage } })
      );

      const mockMessage = {
        messageId: 'test-message-id',
        data: { test: 'data' },
      };

      await waitFor(() => {
        expect(messagingInstance.onMessage).toHaveBeenCalled();
      });

      await act(async () => {
        await messageHandler(mockMessage);
      });

      expect(onForegroundMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('sets up onTokenRefresh listener', async () => {
      const messagingInstance = messaging();

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.onTokenRefresh).toHaveBeenCalled();
      });
    });

    it('updates state and calls callback when token refreshed', async () => {
      const onTokenRefresh = jest.fn();
      const messagingInstance = messaging();

      let tokenRefreshHandler;
      messagingInstance.onTokenRefresh.mockImplementation((handler) => {
        tokenRefreshHandler = handler;
        return jest.fn();
      });

      const { result } = renderHook(() =>
        useFirebaseNotification({ callbacks: { onTokenRefresh } })
      );

      await waitFor(() => {
        expect(messagingInstance.onTokenRefresh).toHaveBeenCalled();
      });

      act(() => {
        tokenRefreshHandler('refreshed-token');
      });

      await waitFor(() => {
        expect(result.current.fcmToken).toBe('refreshed-token');
      });

      expect(onTokenRefresh).toHaveBeenCalledWith('refreshed-token');
    });

    it('sets up onNotificationOpenedApp listener', async () => {
      const messagingInstance = messaging();

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.onNotificationOpenedApp).toHaveBeenCalled();
      });
    });

    it('calls onNotificationOpenedApp callback', async () => {
      const onNotificationOpenedApp = jest.fn();
      const messagingInstance = messaging();

      let notificationOpenedHandler;
      messagingInstance.onNotificationOpenedApp.mockImplementation((handler) => {
        notificationOpenedHandler = handler;
        return jest.fn();
      });

      renderHook(() =>
        useFirebaseNotification({ callbacks: { onNotificationOpenedApp } })
      );

      const mockMessage = {
        messageId: 'opened-message-id',
        data: { action: 'open' },
      };

      await waitFor(() => {
        expect(messagingInstance.onNotificationOpenedApp).toHaveBeenCalled();
      });

      await act(async () => {
        await notificationOpenedHandler(mockMessage);
      });

      expect(onNotificationOpenedApp).toHaveBeenCalledWith(mockMessage);
    });

    it('cleans up listeners on unmount', async () => {
      const messagingInstance = messaging();
      const unsubscribeForeground = jest.fn();
      const unsubscribeTokenRefresh = jest.fn();
      const unsubscribeNotificationOpened = jest.fn();

      messagingInstance.onMessage.mockReturnValue(unsubscribeForeground);
      messagingInstance.onTokenRefresh.mockReturnValue(unsubscribeTokenRefresh);
      messagingInstance.onNotificationOpenedApp.mockReturnValue(
        unsubscribeNotificationOpened
      );

      const { unmount } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.onMessage).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeForeground).toHaveBeenCalled();
      expect(unsubscribeTokenRefresh).toHaveBeenCalled();
      expect(unsubscribeNotificationOpened).toHaveBeenCalled();
    });
  });

  describe('Backend Integration', () => {
    it('sends FCM token to backend when user is authenticated', async () => {
      Platform.OS = 'ios';
      
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('backend-token');

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledWith({
          fcmToken: 'backend-token',
          deviceType: 'ios',
        });
      });
    });

    it('sends token with android deviceType on Android', async () => {
      Platform.OS = 'android';
      
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('android-backend-token');

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledWith({
          fcmToken: 'android-backend-token',
          deviceType: 'android',
        });
      });
    });

    it('skips sending token when user not authenticated', async () => {
      mockAuthModule.default.getState.mockReturnValue({
        token: { accessToken: undefined },
        user: undefined,
      });

      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('no-auth-token');

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.getToken).toHaveBeenCalled();
      });

      // Wait a bit to ensure it doesn't call the API
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(notificationsApi.registerFcmToken).not.toHaveBeenCalled();
    });

    it('does not send duplicate tokens', async () => {


      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('same-token');

      const { rerender } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledTimes(1);
      });

      // Rerender shouldn't trigger duplicate send
      rerender();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(notificationsApi.registerFcmToken).toHaveBeenCalledTimes(1);
    });

    it('handles backend registration error gracefully', async () => {

      (notificationsApi.registerFcmToken as jest.Mock).mockRejectedValue(
        new Error('Backend error')
      );

      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('error-token');

      // Should not throw
      const { result } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalled();
      });

      // Hook should still work despite backend error
      expect(result.current.fcmToken).toBe('error-token');
    });

    it('sends refreshed token to backend when authenticated', async () => {
      const messagingInstance = messaging();
      let tokenRefreshHandler;
      messagingInstance.onTokenRefresh.mockImplementation((handler) => {
        tokenRefreshHandler = handler;
        return jest.fn();
      });

      renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(messagingInstance.onTokenRefresh).toHaveBeenCalled();
      });

      // Clear previous calls
      (notificationsApi.registerFcmToken as jest.Mock).mockClear();

      // Trigger token refresh
      act(() => {
        tokenRefreshHandler('new-refreshed-token');
      });

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledWith({
          fcmToken: 'new-refreshed-token',
          deviceType: expect.any(String),
        });
      });
    });
  });

  describe('Auth Store Integration', () => {
    it('sends token when user logs in after token was retrieved', async () => {
      const authStoreMock = require('@/stores/auth').default;
      
      // Start unauthenticated
      let currentAuthState = {
        token: { accessToken: undefined },
        user: undefined,
      };
      
      authStoreMock.getState.mockImplementation(() => currentAuthState);

      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('login-token');

      // Mock subscribe to capture the callback
      let authStateCallback;
      authStoreMock.subscribe = jest.fn((callback) => {
        authStateCallback = callback;
        return jest.fn(); // unsubscribe function
      });

      const { result, unmount } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(result.current.fcmToken).toBe('login-token');
      });

      expect(notificationsApi.registerFcmToken).not.toHaveBeenCalled();

      // Simulate user login by updating auth state
      currentAuthState = {
        token: { accessToken: 'new-access-token' },
        user: { id: 'user-1' },
      };

      // Call the subscription callback with new state
      await act(async () => {
        if (authStateCallback) {
          authStateCallback(currentAuthState);
        }
      });

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledWith({
          fcmToken: 'login-token',
          deviceType: expect.any(String),
        });
      });
      
      unmount();
    });

    it('unsubscribes from auth store on unmount', async () => {
      const authStoreMock = require('@/stores/auth').default;
      const unsubscribe = jest.fn();
      authStoreMock.subscribe = jest.fn(() => unsubscribe);

      const { unmount } = renderHook(() => useFirebaseNotification());

      await waitFor(() => {
        expect(authStoreMock.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Auto-initialization', () => {
    it('auto-checks permission on mount when autoRequestPermission is false', async () => {
      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result, unmount } = renderHook(() =>
        useFirebaseNotification({ autoRequestPermission: false })
      );

      // Should auto-check on mount
      await waitFor(() => {
        expect(messagingInstance.hasPermission).toHaveBeenCalled();
        expect(result.current.hasPermission).toBe(true);
      });
      
      unmount();
    });

    it('auto-requests permission on mount when autoRequestPermission is true', async () => {
      const messagingInstance = messaging();
      messagingInstance.requestPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );

      const { result, unmount } = renderHook(() =>
        useFirebaseNotification({ autoRequestPermission: true })
      );

      // Should auto-request on mount
      await waitFor(() => {
        expect(messagingInstance.requestPermission).toHaveBeenCalled();
        expect(result.current.hasPermission).toBe(true);
      });
      
      unmount();
    });
  });

  describe('Edge Cases', () => {
    it('handles concurrent token sends', async () => {
      const authStoreMock = require('@/stores/auth').default;
      authStoreMock.getState.mockReturnValue({
        token: { accessToken: 'test-access-token' },
        user: { id: 'user-1' },
      });

      let resolveToken;
      const tokenPromise = new Promise((resolve) => {
        resolveToken = resolve;
      });

      (notificationsApi.registerFcmToken as jest.Mock).mockReturnValue(
        tokenPromise
      );

      const messagingInstance = messaging();
      messagingInstance.hasPermission.mockResolvedValue(
        messaging.AuthorizationStatus.AUTHORIZED
      );
      messagingInstance.getToken.mockResolvedValue('concurrent-token');

      renderHook(() => useFirebaseNotification());

      // Wait for first call to start
      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledTimes(1);
      });

      // Try to trigger another send while first is in progress
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Resolve the first call
      resolveToken({ success: true });

      await waitFor(() => {
        expect(notificationsApi.registerFcmToken).toHaveBeenCalledTimes(1);
      });

      // Should only be called once, not multiple times
      expect(notificationsApi.registerFcmToken).toHaveBeenCalledTimes(1);
    });

    it('updates callbacks ref without recreating listeners', async () => {
      const onForegroundMessage1 = jest.fn();
      const onForegroundMessage2 = jest.fn();

      const messagingInstance = messaging();
      let messageHandler;
      messagingInstance.onMessage.mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { rerender, unmount } = renderHook(
        ({ callbacks }) => useFirebaseNotification({ callbacks }),
        { initialProps: { callbacks: { onForegroundMessage: onForegroundMessage1 } } }
      );

      await waitFor(() => {
        expect(messagingInstance.onMessage).toHaveBeenCalledTimes(1);
      });

      const callCountAfterMount = messagingInstance.onMessage.mock.calls.length;

      // Rerender with new callback
      rerender({ callbacks: { onForegroundMessage: onForegroundMessage2 } });

      // Wait a bit to ensure no re-subscription
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not recreate listener
      expect(messagingInstance.onMessage).toHaveBeenCalledTimes(callCountAfterMount);

      // But new callback should be called
      const mockMessage = { messageId: 'test' };
      await act(async () => {
        if (messageHandler) {
          await messageHandler(mockMessage);
        }
      });

      expect(onForegroundMessage1).not.toHaveBeenCalled();
      expect(onForegroundMessage2).toHaveBeenCalledWith(mockMessage);
      
      unmount();
    });
  });
});
