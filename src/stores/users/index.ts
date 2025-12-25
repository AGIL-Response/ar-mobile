import {
  getTeamMembers,
  getUserRoles,
  getUsersByTenant,
} from '@/api/users';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore, attributesChanged, coordinatesChanged, arrayToCoordinates } from '@/stores/utils';
import type { User, UsersQueryParams } from '@/types';

export interface UsersState extends IBaseState {
  // State properties
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

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
    reset: () => void;
  };
}

const initialState: InitStateType<UsersState> = {
  users: [],
  isLoading: false,
  error: null,
  searchQuery: '',
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
          const user = state.users[userIndex];
          let hasChanges = false;

          // Check if location changed
          const currentCoords = arrayToCoordinates(user.location?.coordinates);
          const newCoords = arrayToCoordinates(location.coordinates);
          const locationChanged = coordinatesChanged(currentCoords, newCoords);

          if (locationChanged) {
            user.location = location;
            hasChanges = true;
          }

          // Check if attributes changed
          if (attributes) {
            const currentAttrs = user.attributes || null;
            const attrsChanged = attributesChanged(currentAttrs, attributes);

            if (attrsChanged) {
              user.attributes = attributes;
              hasChanges = true;
            }
          }

          // Check if status changed
          if (status !== undefined && user.status !== status) {
            user.status = status;
            hasChanges = true;
          }

          // Only trigger re-render if something actually changed
          if (hasChanges) {
            state.users = [...state.users];
          } else {
            console.log(`⏭️ Received socket: skip location update for user ${userId} (no changes detected)`);
          }
        } else {
          console.log(`⏭️ Received socket: skip location update for user ${userId} (user not found)`);
        }
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
