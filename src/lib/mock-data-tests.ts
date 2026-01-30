import type { Incident } from '@/api/incidents/types';
import type { Task } from '@/api/tasks';
import type { Role, User } from '@/types';
import type { AuthState } from '@/stores/auth';
import type { LocationState } from '@/stores/location';
import type { IncidentsState } from '@/stores/incidents';
import type { UseLocationReturn } from '@/lib/hooks/use-location';
import type {
  UserNotification,
  NotificationData,
  NotificationMetadata,
  NotificationActor,
  NotificationType,
} from '@/api/notifications/types';
import { UsersState } from '@/stores/users';
import { TasksState } from '@/stores/tasks';

export const createRole = (overrides: Partial<Role> = {}): Role => ({
  id: `role-${Math.random()}`,
  name: 'role',
  displayName: 'Role',
  description: undefined,
  composite: false,
  clientRole: false,
  containerId: 'container',
  ...overrides,
});

export const createUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${Math.random()}`,
  fullName: 'User Name',
  email: 'user@example.com',
  username: 'username',
  emailVerified: false,
  createdAt: new Date().toISOString(),
  enabled: false,
  updatedAt: new Date().toISOString(),
  roles: [],
  ...overrides,
});

export const createIncident = (
  overrides: Partial<Incident> = {}
): Incident => ({
  tenantId: 'tenant-1',
  id: `incident-${Math.random()}`,
  name: 'Incident Name',
  description: 'Incident description',
  type: 'fire',
  status: 'reported',
  createdByType: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
  incidentAssignees: [],
  incidentTasks: [],
  severity: 'high',
  location: { type: 'Point', coordinates: [103.8198, 1.3521, 0] },
  taskIds: [],
  fileIds: [],
  ...overrides,
});

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  tenantId: 'tenant-1',
  id: 'task-1',
  type: 'investigation',
  name: 'Task name',
  description: 'Task description',
  startTime: '2024-01-02T12:00:00.000Z',
  deadline: '2024-01-10T12:00:00.000Z',
  priority: 'medium',
  status: 'pending',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  deletedBy: null,
  assigneeId: 'assignee-1',
  teamId: 'team-1',
  incidentId: null,
  checklist: [],
  assignee: {
    tenantId: 'tenant-1',
    id: 'assignee-1',
    idpUserId: 'idp-user-1',
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    createdBy: 'user-1',
    updatedBy: null,
    deletedBy: null,
    username: 'assignee',
    email: 'assignee@example.com',
    fullName: 'Assignee User',
    roles: [],
  },
  fileIds: [],
  incident: null,
  ...overrides,
});

export const createAuthState = (
  overrides: Partial<AuthState> = {}
): AuthState => ({
  token: {
    accessToken: undefined,
    expiresIn: undefined,
    refreshToken: undefined,
    idToken: undefined,
  },
  user: undefined,
  tenants: [],
  isCheckingUsername: false,
  usernameError: null,
  geoEntity: undefined,
  actions: {
    checkUsername: jest.fn(),
    loginWithPassword: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    setTokens: jest.fn(),
    setUser: jest.fn(),
    setTenants: jest.fn(),
    setSelectedTenant: jest.fn(),
    setGeoEntity: jest.fn(),
    clearUsernameError: jest.fn(),
    createGeoEntityIfNeeded: jest.fn(),
    updateGeoEntityLocation: jest.fn(),
    setSelectedTeam: jest.fn(),
    updateUser: jest.fn(),
    loginWithOAuth: jest.fn(),
  },
  selectedTeam: null,
  selectedTenant: {
    id: 'tenant-1',
    name: 'tenant1',
    displayName: 'Tenant 1',
  },
  isLoading: false,
  ...overrides,
});

/**
 * Create LocationState for the location store (useLocationStore)
 */
export const createLocationState = (
  overrides: Partial<LocationState> = {}
): LocationState => ({
  currentLocation: null,
  coordinates: null,
  hasLocationPermission: true,
  socket: null,
  isSocketConnected: false,
  isMonitoring: false,
  monitoringInterval: null,
  locationUpdateIntervalMs: 10000,
  lastSentCoordinates: null,
  lastSentAttributes: null,
  error: null,
  isLoading: false,
  actions: {
    requestLocationPermission: jest.fn().mockResolvedValue(true),
    checkLocationPermission: jest.fn().mockResolvedValue(true),
    getCurrentLocation: jest.fn().mockResolvedValue(undefined),
    startLocationMonitoring: jest.fn().mockResolvedValue(undefined),
    stopLocationMonitoring: jest.fn(),
    connectToWebSocket: jest.fn(),
    disconnectFromWebSocket: jest.fn(),
    sendLocationUpdate: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
    setLocationUpdateIntervalMs: jest.fn(),
    ...(overrides.actions || {}),
  },
  ...overrides,
});

/**
 * Create UseLocationReturn for the useLocation hook
 * This is different from the store's LocationState
 */
export const createUseLocationReturn = (
  overrides: Partial<UseLocationReturn> = {}
): UseLocationReturn => ({
  hasPermission: true,
  isLoading: false,
  error: null,
  location: null,
  coordinates: null,
  actions: {
    requestPermission: jest.fn().mockResolvedValue(true),
    getCurrentLocation: jest.fn().mockResolvedValue(undefined),
    refreshLocation: jest.fn().mockResolvedValue(undefined),
    ...(overrides.actions || {}),
  },
  ...overrides,
});
export const createIncidentsState = (
  overrides: Omit<Partial<IncidentsState>, 'actions'> & {
    actions?: Partial<IncidentsState['actions']>;
  } = {}
): IncidentsState => {
  const defaultActions: IncidentsState['actions'] = {
    fetchIncidents: jest.fn().mockResolvedValue(undefined),
    fetchIncident: jest.fn().mockResolvedValue(undefined),
    createIncident: jest.fn().mockResolvedValue(undefined),
    updateIncident: jest.fn().mockResolvedValue(undefined),
    deleteIncident: jest.fn().mockResolvedValue(undefined),
    setSelectedIncident: jest.fn(),
    setSearchQuery: jest.fn(),
    setFilters: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  };

  const { actions: overrideActions, ...restOverrides } = overrides;

  return {
    incidents: [],
    selectedIncident: null,
    isLoading: false,
    isLoadingDetails: false,
    error: null,
    searchQuery: '',
    filters: {},
    actions: {
      ...defaultActions,
      ...(overrideActions || {}),
    },
    ...restOverrides,
  };
};


export const createUsersState = (
  overrides: Omit<Partial<UsersState>, 'actions'> & {
    actions?: Partial<UsersState['actions']>;
  } = {}
): UsersState => {
  const defaultActions: UsersState['actions'] = {
    fetchUsers: jest.fn().mockResolvedValue(undefined),
    fetchUserRoles: jest.fn().mockResolvedValue(undefined),
    setSearchQuery: jest.fn(),
    reset: jest.fn(),
    fetchTeamMembers: jest.fn().mockResolvedValue(undefined),
    updateUserLocation: jest.fn().mockResolvedValue(undefined),
  };

  const { actions: overrideActions, ...restOverrides } = overrides;

  return {
    users: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    actions: {
      ...defaultActions,
      ...(overrideActions || {}),
    },
    ...restOverrides,
  };
};


export const createTasksState = (
  overrides: Omit<Partial<TasksState>, 'actions'> & {
    actions?: Partial<TasksState['actions']>;
  } = {}
): TasksState => {
  const defaultActions: TasksState['actions'] = {
    fetchTasks: jest.fn().mockResolvedValue(undefined),
    fetchTask: jest.fn().mockResolvedValue(undefined),
    updateTaskStatus: jest.fn().mockResolvedValue(undefined),
    setActiveTab: jest.fn(),
    clearSelectedTask: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
    createTask: jest.fn().mockResolvedValue(undefined),
    updateChecklistItem: jest.fn().mockResolvedValue(undefined),
  };

  const { actions: overrideActions, ...restOverrides } = overrides;

  return {
    tasks: [],
    selectedTask: null,
    isLoading: false,
    isLoadingDetail: false,
    error: null,
    pendingTasks: [],
    completedTasks: [],
    activeTab: 'all',
    actions: {
      ...defaultActions,
      ...(overrideActions || {}),
    },
    ...restOverrides,
  };
};

/**
 * Create a mock NotificationActor
 */
export const createNotificationActor = (
  overrides: Partial<NotificationActor> = {}
): NotificationActor => ({
  id: `actor-${Math.random()}`,
  email: 'actor@example.com',
  roles: [],
  tenant: {
    id: 'tenant-1',
    name: 'Tenant 1',
  },
  isAdmin: false,
  teamIds: ['team-1'],
  fullName: 'Actor User',
  username: 'actor',
  idpUserId: `idp-${Math.random()}`,
  emailVerified: true,
  ...overrides,
});

/**
 * Create a mock NotificationMetadata
 */
export const createNotificationMetadata = (
  overrides: Partial<NotificationMetadata> = {}
): NotificationMetadata => ({
  id: `metadata-${Math.random()}`,
  name: 'Notification Metadata',
  actor: createNotificationActor(),
  entityType: 'task',
  ...overrides,
});

/**
 * Create a mock NotificationData
 */
export const createNotificationData = (
  overrides: Partial<NotificationData> = {}
): NotificationData => ({
  tenantId: 'tenant-1',
  id: `notification-data-${Math.random()}`,
  soundFileId: `sound-${Math.random()}`,
  type: 'task_assigned',
  message: 'Task assigned to you',
  metadata: createNotificationMetadata(),
  createdAt: new Date().toISOString(),
  updatedAt: null,
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  deletedBy: null,
  ...overrides,
});

/**
 * Create a mock UserNotification
 */
export const createNotification = (
  overrides: Partial<UserNotification> = {}
): UserNotification => {
  const notificationData = createNotificationData(overrides.notifications || {});
  
  return {
    tenantId: 'tenant-1',
    userId: `user-${Math.random()}`,
    notificationId: `notification-${Math.random()}`,
    status: 'unread',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
    createdBy: 'user-1',
    updatedBy: null,
    deletedBy: null,
    notifications: notificationData,
    message: notificationData.message,
    type: notificationData.type,
    soundFileId: notificationData.soundFileId,
    metadata: notificationData.metadata,
    ...overrides,
  };
};

/**
 * Default actor for notifications (can be reused)
 */
const defaultNotificationActor: NotificationActor = createNotificationActor({
  id: 'actor-1',
  email: 'actor@example.com',
  fullName: 'Actor',
  username: 'actor',
  idpUserId: 'idp-1',
});

/**
 * Create a notification with task metadata
 */
export const createTaskNotification = (
  overrides: Partial<UserNotification> & {
    notificationId?: string;
    taskId?: string;
    taskName?: string;
    type?: NotificationType;
    status?: 'read' | 'unread';
    message?: string;
    createdAt?: string;
  } = {}
): UserNotification => {
  const {
    taskId = 'task-1',
    taskName = 'Task 1',
    notificationId,
    type = 'task_assigned',
    status = 'unread',
    message,
    createdAt,
    ...restOverrides
  } = overrides;

  return createNotification({
    notificationId: notificationId || `notification-${Math.random()}`,
    type,
    status,
    message: message || `${type.replace('_', ' ')}: ${taskName}`,
    createdAt: createdAt || new Date().toISOString(),
    metadata: {
      id: taskId,
      name: taskName,
      actor: defaultNotificationActor,
      entityType: 'task',
    },
    ...restOverrides,
  });
};

/**
 * Create a notification with incident metadata
 */
export const createIncidentNotification = (
  overrides: Partial<UserNotification> & {
    notificationId?: string;
    incidentId?: string;
    incidentName?: string;
    type?: NotificationType;
    status?: 'read' | 'unread';
    message?: string;
    createdAt?: string;
  } = {}
): UserNotification => {
  const {
    incidentId = 'incident-1',
    incidentName = 'Incident 1',
    notificationId,
    type = 'incident_resolved',
    status = 'unread',
    message,
    createdAt,
    ...restOverrides
  } = overrides;

  return createNotification({
    notificationId: notificationId || `notification-${Math.random()}`,
    type,
    status,
    message: message || `${type.replace('_', ' ')}: ${incidentName}`,
    createdAt: createdAt || new Date().toISOString(),
    metadata: {
      id: incidentId,
      name: incidentName,
      actor: defaultNotificationActor,
      entityType: 'incident',
    },
    ...restOverrides,
  });
};