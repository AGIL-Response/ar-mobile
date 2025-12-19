// Unmock the hook to test the real implementation
jest.unmock('@/lib/hooks/use-notifee');

import { renderHook, waitFor } from '@testing-library/react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { router } from 'expo-router';

import { useNotifee, handleAppOpenEvent } from './use-notifee';

const mockAuthModule = require('@/stores/auth');

// Sample notification data
const mockTaskMetadata = {
  id: 'task-123',
  name: 'Test Task',
  entityType: 'task' as const,
  actor: { id: 'actor-1' },
};

const mockIncidentMetadata = {
  id: 'incident-456',
  name: 'Test Incident',
  entityType: 'incident' as const,
  actor: { id: 'actor-2' },
};

const mockRemoteMessage = {
  messageId: 'msg-1',
  notification: {
    title: 'Test Notification',
    body: 'Test Body',
  },
  data: {
    type: 'task_assigned',
    message: 'You have been assigned a task',
    metadata: JSON.stringify(mockTaskMetadata),
  },
};

describe('useNotifee', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset notifee mocks
    (notifee.requestPermission as jest.Mock).mockResolvedValue(true);
    (notifee.createChannel as jest.Mock).mockResolvedValue('default');
    (notifee.displayNotification as jest.Mock).mockResolvedValue(undefined);
    (notifee.getInitialNotification as jest.Mock).mockResolvedValue(null);
    (notifee.onForegroundEvent as jest.Mock).mockReturnValue(jest.fn());
    (notifee.onBackgroundEvent as jest.Mock).mockReturnValue(undefined);

    // Reset messaging mocks
    const messagingInstance = messaging();
    (messagingInstance.getInitialNotification as jest.Mock).mockResolvedValue(null);
    (messagingInstance.onMessage as jest.Mock).mockReturnValue(jest.fn());

    // Reset router mock
    (router.navigate as jest.Mock).mockClear();
    mockAuthModule.default.getState.mockReturnValue({
      token: { accessToken: 'test-token' },
      user: { id: 'user-1' },
    });
    
  });

  describe('Hook Initialization', () => {
    it('registers foreground event handler', () => {
      const { unmount } = renderHook(() => useNotifee());

      expect(notifee.onForegroundEvent).toHaveBeenCalled();

      unmount();
    });

    it('registers Firebase message listener', () => {
      const messagingInstance = messaging();
      const { unmount } = renderHook(() => useNotifee());

      expect(messagingInstance.onMessage).toHaveBeenCalled();

      unmount();
    });

    it('cleans up listeners on unmount', () => {
      const unsubscribeForeground = jest.fn();
      const unsubscribeMessage = jest.fn();

      (notifee.onForegroundEvent as jest.Mock).mockReturnValue(unsubscribeForeground);
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockReturnValue(unsubscribeMessage);

      const { unmount } = renderHook(() => useNotifee());

      unmount();

      expect(unsubscribeForeground).toHaveBeenCalled();
      expect(unsubscribeMessage).toHaveBeenCalled();
    });
  });

  describe('Foreground Event Handling', () => {
    it('handles notification press in foreground', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });

      unmount();
    });

    it('handles action press in foreground', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.ACTION_PRESS,
        detail: {
          notification: {
            data: {
              type: 'incident_created',
              metadata: JSON.stringify(mockIncidentMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
      });

      unmount();
    });

    it('ignores other event types in foreground', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.DISMISSED,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('handles missing notification data in foreground', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {},
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });
  });

  describe('Firebase Message Handling', () => {
    it('displays notification when foreground message received', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      await messageHandler(mockRemoteMessage);

      await waitFor(() => {
        expect(notifee.requestPermission).toHaveBeenCalled();
        expect(notifee.createChannel).toHaveBeenCalled();
        expect(notifee.displayNotification).toHaveBeenCalled();
      });

      unmount();
    });

    it('creates channel with correct importance', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      await messageHandler(mockRemoteMessage);

      await waitFor(() => {
        expect(notifee.createChannel).toHaveBeenCalledWith({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
        });
      });

      unmount();
    });

    it('uses custom sound from notification data', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const messageWithSound = {
        ...mockRemoteMessage,
        data: {
          ...mockRemoteMessage.data,
          soundFileId: 'custom_sound',
        },
      };

      await messageHandler(messageWithSound);

      await waitFor(() => {
        expect(notifee.createChannel).toHaveBeenCalledWith(
          expect.objectContaining({
            sound: 'custom_sound',
          })
        );
      });

      unmount();
    });

    it('handles message without notification payload', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const messageWithoutNotification = {
        messageId: 'msg-2',
        data: {
          type: 'task_assigned',
        },
      };

      await messageHandler(messageWithoutNotification);

      expect(notifee.displayNotification).not.toHaveBeenCalled();

      unmount();
    });

    it('displays notification with parsed metadata', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      await messageHandler(mockRemoteMessage);

      await waitFor(() => {
        expect(notifee.displayNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Notification',
            body: 'Test Body',
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          })
        );
      });

      unmount();
    });
  });

  describe('handleAppOpenEvent', () => {
    it('handles Notifee initial notification', async () => {
      (notifee.getInitialNotification as jest.Mock).mockResolvedValue({
        notification: {
          data: {
            type: 'task_assigned',
            metadata: JSON.stringify(mockTaskMetadata),
          },
        },
        pressAction: { id: 'default' },
      });

      await handleAppOpenEvent();

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });
    });

    it('handles Firebase initial notification when Notifee returns null', async () => {
      (notifee.getInitialNotification as jest.Mock).mockResolvedValue(null);
      
      const messagingInstance = messaging();
      (messagingInstance.getInitialNotification as jest.Mock).mockResolvedValue({
        messageId: 'init-msg',
        data: {
          type: 'incident_created',
          metadata: JSON.stringify(mockIncidentMetadata),
        },
      });

      await handleAppOpenEvent();

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
      });
    });

    it('handles no initial notification from either source', async () => {
      (notifee.getInitialNotification as jest.Mock).mockResolvedValue(null);
      
      const messagingInstance = messaging();
      (messagingInstance.getInitialNotification as jest.Mock).mockResolvedValue(null);

      await handleAppOpenEvent();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('handles Firebase initial notification without data', async () => {
      (notifee.getInitialNotification as jest.Mock).mockResolvedValue(null);
      
      const messagingInstance = messaging();
      (messagingInstance.getInitialNotification as jest.Mock).mockResolvedValue({
        messageId: 'init-msg',
        data: {},
      });

      await handleAppOpenEvent();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('handles error when checking initial notification', async () => {
      (notifee.getInitialNotification as jest.Mock).mockRejectedValue(
        new Error('Notifee error')
      );

      await handleAppOpenEvent();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('handles Firebase initial notification with metadata object', async () => {
      (notifee.getInitialNotification as jest.Mock).mockResolvedValue(null);
      
      const messagingInstance = messaging();
      (messagingInstance.getInitialNotification as jest.Mock).mockResolvedValue({
        messageId: 'init-msg',
        data: {
          type: 'task_updated',
          metadata: mockTaskMetadata, // Object instead of string
        },
      });

      await handleAppOpenEvent();

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });
    });
  });

  describe('Navigation Logic', () => {
    it('navigates to task detail for task_assigned', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });

      unmount();
    });

    it('navigates to task detail for task_created', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_created',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });

      unmount();
    });

    it('navigates to incident detail for incident_created', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'incident_created',
              metadata: JSON.stringify(mockIncidentMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
      });

      unmount();
    });

    it('navigates to incident detail for incident_assigned', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'incident_assigned',
              metadata: JSON.stringify(mockIncidentMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
      });

      unmount();
    });

    it('does not navigate for unknown notification type', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'unknown_type',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('does not navigate when user not logged in', async () => {
      mockAuthModule.default.getState.mockReturnValue({
        token: { accessToken: null },
        user: null,
      });  

      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('handles navigation error gracefully', async () => {
      (router.navigate as jest.Mock).mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      // Should not throw
      await foregroundHandler(event);

      unmount();
    });
  });

  describe('Metadata Parsing', () => {
    it('handles string metadata with single parse', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
      });

      unmount();
    });

    it('handles double-stringified metadata', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'incident_created',
              metadata: JSON.stringify(JSON.stringify(mockIncidentMetadata)),
            },
          },
        },
      };

      await foregroundHandler(event);

      await waitFor(() => {
        expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
      });

      unmount();
    });

    it('handles invalid JSON metadata', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: 'invalid-json',
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('handles missing metadata', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('handles metadata without id', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              type: 'task_assigned',
              metadata: JSON.stringify({
                name: 'Test',
                entityType: 'task',
              }),
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });
  });

  describe('Notification Display', () => {
    it('includes all notification properties', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      await messageHandler(mockRemoteMessage);

      await waitFor(() => {
        expect(notifee.displayNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Notification',
            body: 'Test Body',
            android: expect.objectContaining({
              channelId: 'default',
              importance: AndroidImportance.HIGH,
            }),
            ios: expect.objectContaining({
              sound: 'default',
            }),
          })
        );
      });

      unmount();
    });

    it('uses message field when notification body is missing', async () => {
      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const messageWithoutBody = {
        messageId: 'msg-3',
        notification: {
          title: 'Title Only',
        },
        data: {
          type: 'task_assigned',
          message: 'Message from data',
          metadata: JSON.stringify(mockTaskMetadata),
        },
      };

      await messageHandler(messageWithoutBody);

      await waitFor(() => {
        expect(notifee.displayNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            body: 'Message from data',
          })
        );
      });

      unmount();
    });

    it('handles error during notification display', async () => {
      (notifee.displayNotification as jest.Mock).mockRejectedValue(
        new Error('Display failed')
      );

      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      // Should not throw
      await messageHandler(mockRemoteMessage);

      unmount();
    });

    it('handles channel creation error', async () => {
      (notifee.createChannel as jest.Mock).mockRejectedValue(
        new Error('Channel creation failed')
      );

      let messageHandler: any;
      const messagingInstance = messaging();
      (messagingInstance.onMessage as jest.Mock).mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      // Should not throw
      await messageHandler(mockRemoteMessage);

      unmount();
    });
  });

  describe('Edge Cases', () => {
    it('handles notification without type', async () => {
      let foregroundHandler: any;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
        foregroundHandler = handler;
        return jest.fn();
      });

      const { unmount } = renderHook(() => useNotifee());

      const event = {
        type: EventType.PRESS,
        detail: {
          notification: {
            data: {
              metadata: JSON.stringify(mockTaskMetadata),
            },
          },
        },
      };

      await foregroundHandler(event);

      expect(router.navigate).not.toHaveBeenCalled();

      unmount();
    });

    it('handles all task notification types', async () => {
      const taskTypes = [
        'task_assigned',
        'task_unassigned',
        'task_created',
        'task_updated',
        'task_deleted',
        'task_checklist_updated',
        'idle_task_reminder',
      ];

      for (const type of taskTypes) {
        jest.clearAllMocks();

        let foregroundHandler: any;
        (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
          foregroundHandler = handler;
          return jest.fn();
        });

        const { unmount } = renderHook(() => useNotifee());

        const event = {
          type: EventType.PRESS,
          detail: {
            notification: {
              data: {
                type,
                metadata: JSON.stringify(mockTaskMetadata),
              },
            },
          },
        };

        await foregroundHandler(event);

        await waitFor(() => {
          expect(router.navigate).toHaveBeenCalledWith('/task/task-123');
        });

        unmount();
      }
    });

    it('handles all incident notification types', async () => {
      const incidentTypes = [
        'incident_created',
        'incident_updated',
        'incident_assigned',
        'incident_unassigned',
      ];

      for (const type of incidentTypes) {
        jest.clearAllMocks();

        let foregroundHandler: any;
        (notifee.onForegroundEvent as jest.Mock).mockImplementation((handler) => {
          foregroundHandler = handler;
          return jest.fn();
        });

        const { unmount } = renderHook(() => useNotifee());

        const event = {
          type: EventType.PRESS,
          detail: {
            notification: {
              data: {
                type,
                metadata: JSON.stringify(mockIncidentMetadata),
              },
            },
          },
        };

        await foregroundHandler(event);

        await waitFor(() => {
          expect(router.navigate).toHaveBeenCalledWith('/incidents/incident-456');
        });

        unmount();
      }
    });
  });
});
