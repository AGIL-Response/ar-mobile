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
    it('successfully gets all tasks with default params', async () => {
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

      const result = await taskApi.getTasks();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/tasks?offset=0&limit=100'
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('builds query string with custom params', async () => {
      const params = {
        offset: 10,
        limit: 20,
        assigneeId: 'user-1',
        status: 'pending' as const,
      };

      const mockResponse = {
        data: {
          code: '200',
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await taskApi.getTasks(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?')
      );
      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).toContain('limit=20');
      expect(callUrl).toContain('assigneeId=user-1');
      expect(callUrl).toContain('status=pending');
    });

    it('excludes undefined and null params from query string', async () => {
      const params = {
        offset: 10,
        limit: undefined,
        assigneeId: null as unknown as string,
      };

      const mockResponse = {
        data: {
          code: '200',
          data: [],
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await taskApi.getTasks(params);

      const callUrl = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('offset=10');
      expect(callUrl).not.toContain('limit=');
      expect(callUrl).not.toContain('assigneeId=');
    });

    it('handles errors', async () => {
      const error = new Error('Failed to get tasks');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to get tasks',
        status: 500,
      });

      await expect(taskApi.getTasks()).rejects.toEqual({
        message: 'Failed to get tasks',
        status: 500,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('getTask', () => {
    it('successfully gets a single task', async () => {
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

      const result = await taskApi.getTask(taskId);

      expect(apiClient.get).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const taskId = 'task-1';

      const error = new Error('Task not found');
      (apiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Task not found',
        status: 404,
      });

      await expect(taskApi.getTask(taskId)).rejects.toEqual({
        message: 'Task not found',
        status: 404,
      });
    });
  });

  describe('createTask', () => {
    it('successfully creates a task', async () => {
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        type: 'investigation' as const,
        priority: 'high' as const,
        startTime: '2024-01-01T00:00:00Z',
        deadline: '2024-01-10T00:00:00Z',
        assigneeIds: ['user-1'],
        status: 'pending' as const,
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

      const result = await taskApi.createTask(taskData);

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        type: 'investigation' as const,
        priority: 'high' as const,
        status: 'pending' as const,
      };

      const error = new Error('Failed to create task');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to create task',
        status: 400,
      });

      await expect(taskApi.createTask(taskData)).rejects.toEqual({
        message: 'Failed to create task',
        status: 400,
      });
    });
  });

  describe('updateTask', () => {
    it('successfully updates a task', async () => {
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

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.updateTask(taskId, updateData);

      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/task-1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const taskId = 'task-1';
      const updateData = {
        name: 'Updated Task',
      };

      const error = new Error('Failed to update task');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to update task',
        status: 400,
      });

      await expect(taskApi.updateTask(taskId, updateData)).rejects.toEqual({
        message: 'Failed to update task',
        status: 400,
      });
    });
  });

  describe('updateChecklistItem', () => {
    it('successfully updates a checklist item', async () => {
      const checklistId = 'checklist-1';
      const updateData = {
        isCompleted: true,
        description: 'Updated checklist item',
        updatedAt: new Date().toISOString(),
      };

      const mockResponse = {
        data: {
          code: '200',
          data: {
            id: checklistId,
            ...updateData,
          },
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await taskApi.updateChecklistItem(checklistId, updateData);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/checklists/checklist-1',
        updateData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles errors', async () => {
      const checklistId = 'checklist-1';
      const updateData = {
        isCompleted: true,
        updatedAt: new Date().toISOString(),
        description: 'Updated checklist item',
      };

      const error = new Error('Failed to update checklist item');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to update checklist item',
        status: 400,
      });

      await expect(
        taskApi.updateChecklistItem(checklistId, updateData)
      ).rejects.toEqual({
        message: 'Failed to update checklist item',
        status: 400,
      });
    });
  });

  describe('deleteTask', () => {
    it('successfully deletes a task', async () => {
      const taskId = 'task-1';

      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await taskApi.deleteTask(taskId);

      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/task-1');
    });

    it('handles errors', async () => {
      const taskId = 'task-1';

      const error = new Error('Failed to delete task');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Failed to delete task',
        status: 404,
      });

      await expect(taskApi.deleteTask(taskId)).rejects.toEqual({
        message: 'Failed to delete task',
        status: 404,
      });
    });
  });
});

