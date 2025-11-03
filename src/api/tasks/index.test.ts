import * as taskApi from './index';
import { apiClient, handleApiError } from '../api-client';

// Mock dependencies
jest.mock('../api-client');
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();

describe('taskApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('successfully gets all tasks', async () => {
      const tenantId = 'tenant-1';
      const mockResponse = {
        data: {
          code: '200',
          data: [
            {
              id: 'task-1',
              name: 'Task 1',
              type: 'maintenance' as const,
              priority: 'high' as const,
              status: 'pending' as const,
            },
            {
              id: 'task-2',
              name: 'Task 2',
              type: 'emergency' as const,
              priority: 'medium' as const,
              status: 'in_progress' as const,
            },
          ],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.getTasks(tenantId);

      expect(apiClient.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const error = new Error('Failed to get tasks');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get tasks',
        status: 500,
      });

      await expect(taskApi.getTasks(tenantId)).rejects.toEqual({
        message: 'Failed to get tasks',
        status: 500,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('getTask', () => {
    it('successfully gets a single task', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';

      const mockTask = {
        id: 'task-1',
        name: 'Test Task',
        type: 'maintenance' as const,
        priority: 'high' as const,
        status: 'pending' as const,
      };

      const mockResponse = {
        data: {
          code: '200',
          data: mockTask,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.getTask(tenantId, taskId);

      expect(apiClient.get).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';

      const error = new Error('Task not found');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Task not found',
        status: 404,
      });

      await expect(taskApi.getTask(tenantId, taskId)).rejects.toEqual({
        message: 'Task not found',
        status: 404,
      });
    });
  });

  describe('createTask', () => {
    it('successfully creates a task', async () => {
      const tenantId = 'tenant-1';
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        type: 'maintenance' as const,
        priority: 'high' as const,
        startTime: '2024-01-01T00:00:00Z',
        deadline: '2024-01-10T00:00:00Z',
        assigneeIds: ['user-1'],
      };

      const mockTask = {
        id: 'task-1',
        ...taskData,
      };

      const mockResponse = {
        data: {
          code: '200',
          data: mockTask,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.createTask(tenantId, taskData);

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        type: 'maintenance' as const,
        priority: 'high' as const,
      };

      const error = new Error('Failed to create task');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to create task',
        status: 400,
      });

      await expect(taskApi.createTask(tenantId, taskData)).rejects.toEqual({
        message: 'Failed to create task',
        status: 400,
      });
    });
  });

  describe('updateTask', () => {
    it('successfully updates a task', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';
      const updateData = {
        name: 'Updated Task',
        status: 'in_progress' as const,
        priority: 'medium' as const,
      };

      const mockTask = {
        id: 'task-1',
        ...updateData,
      };

      const mockResponse = {
        data: {
          code: '200',
          data: mockTask,
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.updateTask(tenantId, taskId, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/tasks/task-1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';
      const updateData = {
        name: 'Updated Task',
      };

      const error = new Error('Failed to update task');
      (apiClient.put as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to update task',
        status: 400,
      });

      await expect(
        taskApi.updateTask(tenantId, taskId, updateData)
      ).rejects.toEqual({
        message: 'Failed to update task',
        status: 400,
      });
    });
  });

  describe('deleteTask', () => {
    it('successfully deletes a task', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';

      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await taskApi.deleteTask(tenantId, taskId);

      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/task-1');
    });

    it('handles errors', async () => {
      const tenantId = 'tenant-1';
      const taskId = 'task-1';

      const error = new Error('Failed to delete task');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to delete task',
        status: 404,
      });

      await expect(taskApi.deleteTask(tenantId, taskId)).rejects.toEqual({
        message: 'Failed to delete task',
        status: 404,
      });
    });
  });
});

