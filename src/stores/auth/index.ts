import { type LoginRequest, type RegisterRequest } from '@/api/auth/types';
import login from '@/stores/auth/actions/login';
import register from '@/stores/auth/actions/register';
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

  actions: {
    login: (username: string, password: string) => Promise<any>;
    register: (params: RegisterRequest) => Promise<any>;
    logout: () => void;
    setTokens: (tokens: ITokens) => void;
    setUser: (user: any) => void;
  };
}

const initialState: InitStateType<AuthState> = {
  token: {
    accessToken: undefined,
    expiresIn: undefined,
    refreshToken: undefined,
  },
  user: undefined,
};

const authStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    login: login(set, get),
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
  },
  reset: () => resetStore(initialState, set),
});

const useAuthStore = createStore<AuthState>(authStore);

export default useAuthStore;
