import { type RegisterRequest } from '@/api/auth/types';
// eslint-disable-next-line import/no-cycle
import checkUsername from '@/stores/auth/actions/check-username';
// eslint-disable-next-line import/no-cycle
import createGeoEntityIfNeeded from '@/stores/auth/actions/create-geo-entity-if-needed';
// eslint-disable-next-line import/no-cycle
import loginWithPassword from '@/stores/auth/actions/login-with-password';
import register from '@/stores/auth/actions/register';
import updateGeoEntityLocation from '@/stores/auth/actions/update-geo-entity-location';
import type IBaseState from '@/stores/interfaces/IBaseState';
import { type InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import { type GeoEntity } from '@/types/geo-entity';

interface ITokens {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  idToken?: string;
}

export interface ITenant {
  name: string;
  displayName: string;
}

interface IUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tenantId: string;
  realm: string;
  roles: string[];
  permissions: string[];
  teamRoles?: any[];
}

export interface AuthState extends IBaseState {
  token: {
    accessToken: string | undefined;
    expiresIn: number | undefined;
    refreshToken: string | undefined;
    idToken?: string | undefined;
  };
  user: IUser | undefined;
  tenants: ITenant[];
  selectedTenant: ITenant | null;
  isLoading: boolean;
  isCheckingUsername: boolean;
  usernameError: string | null;
  geoEntity: GeoEntity | undefined;

  actions: {
    checkUsername: (username: string) => Promise<string | null>;
    loginWithPassword: (username: string, password: string) => Promise<any>;
    register: (params: RegisterRequest) => Promise<any>;
    logout: () => void;
    setTokens: (tokens: ITokens) => void;
    setUser: (user: IUser) => void;
    setTenants: (tenants: ITenant[]) => void;
    setSelectedTenant: (tenant: ITenant | null) => void;
    setGeoEntity: (geoEntity: GeoEntity) => void;
    clearUsernameError: () => void;
    createGeoEntityIfNeeded: () => Promise<void>;
    updateGeoEntityLocation: (lat: number, lon: number) => Promise<void>;
  };
}

const initialState: InitStateType<AuthState> = {
  token: {
    accessToken: undefined,
    expiresIn: undefined,
    refreshToken: undefined,
    idToken: undefined,
  },
  user: undefined,
  tenants: [],
  selectedTenant: null,
  isLoading: false,
  isCheckingUsername: false,
  usernameError: null,
  geoEntity: undefined,
};

const authStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    checkUsername: checkUsername(set, get),
    loginWithPassword: loginWithPassword(set, get),
    register: register(set, get),
    logout: () => {
      set((state: AuthState) => {
        state.token = initialState.token;
        state.user = undefined;
        state.tenants = [];
        state.selectedTenant = null;
        state.geoEntity = undefined;
        state.usernameError = null;
        state.isCheckingUsername = false;
      });
    },
    setTokens: (tokens: ITokens) => {
      set((state: AuthState) => {
        state.token = tokens;
      });
    },
    setUser: (user: IUser) => {
      set((state: AuthState) => {
        state.user = user;
      });
    },
    setTenants: (tenants: ITenant[]) => {
      set((state: AuthState) => {
        state.tenants = tenants;
        // Auto-select first tenant if available
        if (tenants.length > 0 && !state.selectedTenant) {
          state.selectedTenant = tenants[0];
        }
      });
    },
    setSelectedTenant: (tenant: ITenant | null) => {
      set((state: AuthState) => {
        state.selectedTenant = tenant;
      });
    },
    setGeoEntity: (geoEntity: GeoEntity) => {
      set((state: AuthState) => {
        state.geoEntity = geoEntity;
      });
    },
    clearUsernameError: () => {
      set((state: AuthState) => {
        state.usernameError = null;
      });
    },
    createGeoEntityIfNeeded: createGeoEntityIfNeeded(set, get),
    updateGeoEntityLocation: updateGeoEntityLocation(set, get),
  },
  reset: () => resetStore(initialState, set),
});

const useAuthStore = createStore<AuthState>(authStore);

export default useAuthStore;
