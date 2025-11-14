import { getTeamMembers, getUserRoles, getUsersByTenant } from '@/api/users';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import type { User, UsersQueryParams } from '@/types';

export interface UsersState extends IBaseState {
  // State properties
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  mapFocusUserId: string | null;

  // Actions namespace
  actions: {
    fetchUsers: (tenantId: string, params?: UsersQueryParams) => Promise<void>;
    fetchTeamMembers: (teamId: string) => Promise<void>;
    fetchUserRoles: (userId: string, tenantId: string) => Promise<void>;
    updateUserLocation: (
      userId: string,
      location: { type: string; coordinates: number[] },
      attributes?: { networkMbps?: number; batteryPercentage?: number },
      status?: string
    ) => void;
    setSearchQuery: (query: string) => void;
    setMapFocusUserId: (userId: string | null) => void;
    reset: () => void;
  };
}

const initialState: InitStateType<UsersState> = {
  users: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  mapFocusUserId: null,
};

const usersStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    fetchUsers: async (tenantId: string, params?: UsersQueryParams) => {
      set((state: UsersState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const users = await getUsersByTenant(tenantId, params);

        set((state: UsersState) => {
          state.users = users;
          state.isLoading = false;
        });
      } catch (error) {
        set((state: UsersState) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to fetch users';
          state.isLoading = false;
        });
      }
    },

    fetchTeamMembers: async (teamId: string) => {
      set((state: UsersState) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const users = await getTeamMembers(teamId);

        set((state: UsersState) => {
          state.users = users;
          state.isLoading = false;
        });
      } catch (error) {
        set((state: UsersState) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch team members';
          state.isLoading = false;
        });
      }
    },

    fetchUserRoles: async (userId: string, tenantId: string) => {
      try {
        const roles = await getUserRoles(userId, tenantId);

        set((state: UsersState) => {
          const userIndex = state.users.findIndex((user) => user.id === userId);
          if (userIndex !== -1) {
            state.users[userIndex].roles = roles;
          }
        });
      } catch (error) {
        set((state: UsersState) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to fetch user roles';
        });
      }
    },

    updateUserLocation: (
      userId: string,
      location: { type: string; coordinates: number[] },
      attributes?: { networkMbps?: number; batteryPercentage?: number },
      status?: string
    ) => {
      set((state: UsersState) => {
        const userIndex = state.users.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          // Update location
          state.users[userIndex].location = location;

          // Update attributes if provided
          if (attributes) {
            state.users[userIndex].attributes = attributes;
          }

          // Update status if provided
          if (status !== undefined) {
            state.users[userIndex].status = status;
          }
        }
      });
    },

    setMapFocusUserId: (userId: string | null) => {
      set((state: UsersState) => {
        state.mapFocusUserId = userId;
      });
    },

    setSearchQuery: (query: string) => {
      set((state: UsersState) => {
        state.searchQuery = query;
      });
    },

    reset: () => resetStore(initialState, set),
  },
  reset: () => resetStore(initialState, set),
});

export const useUsersStore = createStore<UsersState>(usersStore);
