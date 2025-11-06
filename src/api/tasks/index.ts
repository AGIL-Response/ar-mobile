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
    
    console.log(`🚀 Request: GET ${url}`);
    const response = await apiClient.get(url);
    console.log(`✅ Response: GET ${url}`, response.data);
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
    console.log(`🚀 Request: GET /tasks/${taskId}`);
    const response = await apiClient.get(`/tasks/${taskId}`);
    console.log(`✅ Response: GET /tasks/${taskId}`, response.data);
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
    console.log(`🚀 Request: POST /tasks`);
    console.log(`📦 Request Body:`, data);
    const response = await apiClient.post(`/tasks`, data);
    console.log(`✅ Response: POST /tasks`, response.data);
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
    console.log(`🚀 Request: PUT /tasks/${taskId}`);
    console.log(`📦 Request Body:`, data);
    const response = await apiClient.put(`/tasks/${taskId}`, data);
    console.log(`✅ Response: PUT /tasks/${taskId}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: PUT /tasks/${taskId}`, error);
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
    console.log(`🚀 Request: PATCH /checklists/${checklistId}`);
    console.log(`📦 Request Body:`, data);
    const response = await apiClient.patch(`/checklists/${checklistId}`, data);
    console.log(`✅ Response: PATCH /checklists/${checklistId}`, response.data);
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
    console.log(`🚀 Request: DELETE /tasks/${taskId}`);
    await apiClient.delete(`/tasks/${taskId}`);
    console.log(`✅ Response: DELETE /tasks/${taskId}`);
  } catch (error) {
    console.error(`❌ Error: DELETE /tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

// Re-export types for convenience
export * from './types';
