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
    console.log(`🚀 Request: GET /tenants/${tenantId}/tasks`);
    const response = await apiClient.get(`/tenants/${tenantId}/tasks`);
    console.log(`✅ Response: GET /tenants/${tenantId}/tasks`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: GET /tenants/${tenantId}/tasks`, error);
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
    console.log(`🚀 Request: GET /tenants/${tenantId}/tasks/${taskId}`);
    const response = await apiClient.get(`/tenants/${tenantId}/tasks/${taskId}`);
    console.log(`✅ Response: GET /tenants/${tenantId}/tasks/${taskId}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: GET /tenants/${tenantId}/tasks/${taskId}`, error);
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
    console.log(`🚀 Request: POST /tenants/${tenantId}/tasks`);
    console.log(`📦 Request Body:`, data);
    const response = await apiClient.post(`/tenants/${tenantId}/tasks`, data);
    console.log(`✅ Response: POST /tenants/${tenantId}/tasks`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: POST /tenants/${tenantId}/tasks`, error);
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
    console.log(`🚀 Request: PUT /tenants/${tenantId}/tasks/${taskId}`);
    console.log(`📦 Request Body:`, data);
    const response = await apiClient.put(`/tenants/${tenantId}/tasks/${taskId}`, data);
    console.log(`✅ Response: PUT /tenants/${tenantId}/tasks/${taskId}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: PUT /tenants/${tenantId}/tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (tenantId: string, taskId: string): Promise<void> => {
  try {
    console.log(`🚀 Request: DELETE /tenants/${tenantId}/tasks/${taskId}`);
    await apiClient.delete(`/tenants/${tenantId}/tasks/${taskId}`);
    console.log(`✅ Response: DELETE /tenants/${tenantId}/tasks/${taskId}`);
  } catch (error) {
    console.error(`❌ Error: DELETE /tenants/${tenantId}/tasks/${taskId}`, error);
    throw handleApiError(error);
  }
};

// Re-export types for convenience
export * from './types';
