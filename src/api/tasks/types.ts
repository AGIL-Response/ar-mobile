/**
 * Task API Types
 * Type definitions for task-related API requests and responses
 */

export type TaskType = 'investigation' | 'evacuation' | 'rescue' | 'mitigation' | 'reporting' | 'support' | 'sos' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  updatedAt: string | null;
}

export interface TaskIncident {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface TaskAssignee {
  tenantId: string;
  id: string;
  idpUserId: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  username: string;
  email: string;
  fullName: string;
  avatarId?: string;
  description?: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  location?: {
    type: string;
    coordinates: number[];
  };
}

export interface Task {
  tenantId: string;
  id: string;
  type: TaskType;
  name: string;
  description: string;
  startTime: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  assigneeId: string;
  teamId: string;
  incidentId: string | null;
  checklist: ChecklistItem[];
  assignee: TaskAssignee;
  fileIds: string[];
  incident: TaskIncident | null;
}


export interface TasksQueryParams {
  assigneeId?: string;
  teamId?: string;
  offset?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface GetTasksResponse {
  code: string;
  data: Task[];
  message: string;
  pagination: {
    total: number;
    hasNextPage: boolean;
  };
}

export interface GetTaskResponse {
  code: string;
  data: Task;
}

export interface CreateTaskRequest {
  type: TaskType;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: string;
  teamId?: string;
  startTime?: string;
  deadline?: string;
  zoneId?: string;
  incidentId?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  checklist?: {
    description: string;
  }[];
}

export interface UpdateTaskRequest {
  updatedAt?: string;
  name?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  startTime?: string;
  deadline?: string;
  incidentId?: string;
  location?: {
    type: string;
    coordinates: number[][][];
  };
}

export interface CreateTaskResponse {
  code: string;
  data: Task;
}

export interface UpdateChecklistItemRequest {
  updatedAt: string;
  description: string;
  isCompleted: boolean;
}

export interface UpdateChecklistItemResponse {
  code: string;
  data: ChecklistItem;
}
