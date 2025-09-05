/**
 * Task API Types
 * Type definitions for task-related API requests and responses
 */

export type TaskType = 'maintenance' | 'emergency' | 'inspection' | 'training' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | null;

export interface Task {
  tenantId: string;
  id: string;
  type: TaskType;
  name: string;
  description: string;
  startTime: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  assignees?: TaskAssignee[];
}

export interface TaskAssignee {
  id: string;
  userId: string;
  taskId: string;
  assignedAt: string;
  assignedBy: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface GetTasksResponse {
  code: string;
  data: Task[];
}

export interface GetTaskResponse {
  code: string;
  data: Task;
}

export interface CreateTaskRequest {
  name: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  startTime?: string;
  deadline?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  startTime?: string;
  deadline?: string;
}

export interface CreateTaskResponse {
  code: string;
  data: Task;
}

export interface UpdateTaskResponse {
  code: string;
  data: Task;
}
