/**
 * Task API
 * API endpoints for task management
 */

import { apiClient, handleApiError } from '../api-client';
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetTaskResponse,
  GetTasksResponse,
  TasksQueryParams,
  UpdateChecklistItemRequest,
  UpdateChecklistItemResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from './types';

/**
 * Get all tasks with query parameters
 */
export const getTasks = async (params: TasksQueryParams = {}): Promise<GetTasksResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Set default parameters
    const defaultParams = {
      offset: 0,
      limit: 100,
      ...params
    };
    
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = `/tasks${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: GET /tasks`, error);
    throw handleApiError(error);
  }
};

/**
 * Get a specific task by ID
 */
export const getTask = async (taskId: string): Promise<GetTaskResponse> => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: GET /tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

/**
 * Create a new task
 */
export const createTask = async (data: CreateTaskRequest): Promise<CreateTaskResponse> => {
  try {
    const response = await apiClient.post(`/tasks`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: POST /tasks`, error);
    throw handleApiError(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (
  taskId: string,
  data: UpdateTaskRequest
): Promise<UpdateTaskResponse> => {
  try {
    const response = await apiClient.patch(`/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: PATCH /tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

/**
 * Update a checklist item
 */
export const updateChecklistItem = async (
  checklistId: string,
  data: UpdateChecklistItemRequest
): Promise<UpdateChecklistItemResponse> => {
  try {
    const response = await apiClient.patch(`/checklists/${checklistId}`, data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: PATCH /checklists/${checklistId}`, error);
    throw handleApiError(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await apiClient.delete(`/tasks/${taskId}`);
  } catch (error) {
    console.error(`❌ Error: DELETE /tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

// Re-export types for convenience
export * from './types';
