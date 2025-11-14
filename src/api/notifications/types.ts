/**
 * Notifications API Types
 * Type definitions for notifications API requests and responses
 */

export type NotificationStatus = 'read' | 'unread';
export type NotificationType =
  | 'task_assigned'
  | 'incident_assigned'
  | 'task_completed'
  | 'incident_resolved'
  | 'team_update'
  | 'system_maintenance';

export interface NotificationActor {
  id: string;
  email: string;
  roles: string[];
  tenant: {
    id: string;
    name: string;
  };
  isAdmin: boolean;
  teamIds: string[];
  fullName: string;
  username: string;
  idpUserId: string;
  emailVerified: boolean;
}

export interface NotificationMetadata {
  id: string;
  name: string;
  actor: NotificationActor;
  entityType: string;
}

export interface NotificationData {
  tenantId: string;
  id: string;
  soundFileId: string;
  type: NotificationType;
  message: string;
  metadata: NotificationMetadata;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
}

export interface UserNotification {
  tenantId: string;
  userId: string;
  notificationId: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  notifications: NotificationData;
  message: string;
  type: NotificationType;
  soundFileId: string;
  metadata: NotificationMetadata;
}

export interface NotificationsQueryParams {
  status?: NotificationStatus;
  userId?: string;
  offset?: number;
  limit?: number;
  sort?: string;
  count?: boolean;
}

export interface NotificationsResponse {
  code: string;
  data: UserNotification[];
  message: string;
  pagination: {
    total: number;
    hasNextPage: boolean;
  };
}

export interface NotificationsUnreadCountResponse {
  code: string;
  data: {
    type: NotificationType;
    message: string;
    metadata: NotificationMetadata;
    userId: string;
    notificationId: string;
    status: NotificationStatus;
  }[];
  message: string;
  pagination: {
    total: number;
    hasNextPage: boolean;
  };
}

export interface MarkNotificationReadRequest {
  notificationId: string;
  status: NotificationStatus;
}

export interface MarkNotificationReadResponse {
  code: string;
  data: {
    tenantId: string;
    userId: string;
    notificationId: string;
    status: NotificationStatus;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
    deletedBy: string | null;
  };
  message: string;
}
