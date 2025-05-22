import { type RegisterRequest } from '@/api/auth/types';
// eslint-disable-next-line import/no-cycle
import createGeoEntityIfNeeded from '@/stores/auth/actions/create-geo-entity-if-needed';
// eslint-disable-next-line import/no-cycle
import login from '@/stores/auth/actions/login';
import register from '@/stores/auth/actions/register';
import updateGeoEntityLocation from '@/stores/auth/actions/update-geo-entity-location';
import type IBaseState from '@/stores/interfaces/IBaseState';
import { type InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';

interface ITokens {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface AuthState extends IBaseState {
  token: {
    accessToken: string | undefined;
    expiresIn: number | undefined;
    refreshToken: string | undefined;
  };
  user: any;
  isLoading: boolean;
  geoEntity?: any;

  actions: {
    login: (username: string, password: string) => Promise<any>;
    register: (params: RegisterRequest) => Promise<any>;
    logout: () => void;
    setTokens: (tokens: ITokens) => void;
    setUser: (user: any) => void;
    setGeoEntity: (geoEntity: any) => void;
    createGeoEntityIfNeeded: () => Promise<void>;
    updateGeoEntityLocation: (lat: number, lon: number) => Promise<void>;
  };
}

const initialState: InitStateType<AuthState> = {
  token: {
    accessToken: undefined,
    expiresIn: undefined,
    refreshToken: undefined,
  },
  user: undefined,
  isLoading: false,
  geoEntity: undefined,
};

const authStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    login: async (username: string, password: string) => {
      const response = await login(set, get)(username, password);
      await get().actions.createGeoEntityIfNeeded();
      return response;
    },
    register: register(set, get),
    logout: () => {
      set((state: AuthState) => {
        state.token = initialState.token;
      });
    },
    setTokens: (tokens: ITokens) => {
      set((state: AuthState) => {
        state.token = tokens;
      });
    },
    setUser: (user: any) => {
      set((state: AuthState) => {
        state.user = user;
      });
    },
    setGeoEntity: (geoEntity: any) => {
      set((state: AuthState) => {
        state.geoEntity = geoEntity;
      });
    },
    createGeoEntityIfNeeded: createGeoEntityIfNeeded(set, get),
    updateGeoEntityLocation: updateGeoEntityLocation(set, get),
  },
  reset: () => resetStore(initialState, set),
});

const useAuthStore = createStore<AuthState>(authStore);

export default useAuthStore;
