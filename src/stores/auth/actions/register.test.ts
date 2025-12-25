import register from './register';

import { authApi, handleApiError } from '@/api';
import type { RegisterRequest } from '@/api/auth/types';

describe('register', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof register>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet = jest.fn();
    mockGet = jest.fn();
    action = register(mockSet, mockGet);
  });

  it('successfully registers a user', async () => {
    const registerRequest: RegisterRequest = {
      action: 'register',
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
    };

    const mockResponse = {
      success: true,
      message: 'User registered successfully',
    };

    (authApi.register as jest.Mock).mockResolvedValue(mockResponse);

    const result = await action(registerRequest);

    expect(authApi.register).toHaveBeenCalledWith(registerRequest);
    expect(result).toEqual(mockResponse);
  });

  it('handles registration errors', async () => {
    const registerRequest: RegisterRequest = {
      action: 'register',
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
    };

    const apiError = new Error('Username already exists');
    (authApi.register as jest.Mock).mockRejectedValue(apiError);
    (handleApiError as jest.Mock).mockReturnValue({
      message: 'Username already exists',
    });

    await expect(action(registerRequest)).rejects.toEqual({
      message: 'Username already exists',
    });

    expect(handleApiError).toHaveBeenCalledWith(apiError);
  });
});
