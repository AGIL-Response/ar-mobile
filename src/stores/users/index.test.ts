// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/users');

import { act, renderHook } from '@testing-library/react-native';

import { useUsersStore } from './index';

import { getUserRoles, getUsersByTenant } from '@/api/users';
import { User } from '@/types';

jest.mock('@/api/users', () => ({
  getUserRoles: jest.fn(),
  getUsersByTenant: jest.fn(),
}));

describe('UsersStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUsersStore.getState().reset?.();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useUsersStore());

      expect(result.current.users).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('fetchUsers', () => {
    it('successfully fetches users', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', fullName: 'User One' },
        { id: '2', username: 'user2', fullName: 'User Two' },
      ];
      (getUsersByTenant as jest.Mock).mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useUsersStore());

      await act(async () => {
        await result.current.actions.fetchUsers('tenant-1');
      });

      expect(getUsersByTenant).toHaveBeenCalledWith('tenant-1', undefined);
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('passes query params to API', async () => {
      (getUsersByTenant as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useUsersStore());

      const params = { limit: 10, offset: 0 };
      await act(async () => {
        await result.current.actions.fetchUsers('tenant-1', params);
      });

      expect(getUsersByTenant).toHaveBeenCalledWith('tenant-1', params);
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Failed to fetch users';
      (getUsersByTenant as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useUsersStore());

      await act(async () => {
        await result.current.actions.fetchUsers('tenant-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });

    it('sets loading state during fetch', async () => {
      (getUsersByTenant as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([]), 100);
          })
      );

      const { result } = renderHook(() => useUsersStore());

      act(() => {
        result.current.actions.fetchUsers('tenant-1');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchUserRoles', () => {
    it('successfully fetches and updates user roles', async () => {
      const mockRoles = [
        { id: 'role1', name: 'Admin' },
        { id: 'role2', name: 'User' },
      ];
      const user = { id: '1', username: 'user1', roles: [] };

      const { result } = renderHook(() => useUsersStore());

      act(() => {
        result.current.users = [user as unknown as User];
      });

      (getUserRoles as jest.Mock).mockResolvedValue(mockRoles);

      await act(async () => {
        await result.current.actions.fetchUserRoles('1', 'tenant-1');
      });

      expect(getUserRoles).toHaveBeenCalledWith('1', 'tenant-1');
      expect(result.current.users[0].roles).toEqual(mockRoles);
    });

    it('does not update if user not found', async () => {
      const { result } = renderHook(() => useUsersStore());

      act(() => {
        result.current.users = [{ id: '2', username: 'user2' }] as User[];
      });

      (getUserRoles as jest.Mock).mockResolvedValue([{ id: 'role1' }]);

      await act(async () => {
        await result.current.actions.fetchUserRoles('1', 'tenant-1');
      });

      expect(result.current.users[0].roles).toBeUndefined();
    });

    it('handles fetch error correctly', async () => {
      const errorMessage = 'Failed to fetch roles';
      (getUserRoles as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUsersStore());

      await act(async () => {
        await result.current.actions.fetchUserRoles('1', 'tenant-1');
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('setSearchQuery', () => {
    it('updates search query', () => {
      const { result } = renderHook(() => useUsersStore());

      act(() => {
        result.current.actions.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useUsersStore());

      act(() => {
        result.current.users = [{ id: '1' }] as User[];
        result.current.error = 'Error';
        result.current.searchQuery = 'query';
      });

      act(() => {
        result.current.reset?.();
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.searchQuery).toBe('');
    });
  });
});
