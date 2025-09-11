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
  UpdateTaskRequest,
  UpdateTaskResponse,
} from './types';

/**
 * Get all tasks for a tenant
 */
export const getTasks = async (tenantId: string): Promise<GetTasksResponse> => {
  try {
    console.log(`🚀 Request: GET /tasks`);
    const response = await apiClient.get(`/tasks`);
    console.log(`✅ Response: GET /tasks`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: GET /tasks`, error);
    throw handleApiError(error);
  }
};

/**
 * Get a specific task by ID
 */
export const getTask = async (
  tenantId: string,
  taskId: string
): Promise<GetTaskResponse> => {
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
export const createTask = async (
  tenantId: string,
  data: CreateTaskRequest
): Promise<CreateTaskResponse> => {
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
  tenantId: string,
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
 * Delete a task
 */
export const deleteTask = async (tenantId: string, taskId: string): Promise<void> => {
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
