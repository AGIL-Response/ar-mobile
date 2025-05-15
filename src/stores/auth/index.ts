import IBaseState, { InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import login, { LoginVariables } from '@/stores/auth/actions/login';

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

  actions: {
    login: (params: LoginVariables) => Promise<any>;
    logout: () => void;
    register: () => void;
    setTokens: (tokens: ITokens) => void;
  };
}

const initialState: InitStateType<AuthState> = {
  token: {
    accessToken: undefined,
    expiresIn: undefined,
    refreshToken: undefined,
  },
};

const authStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    login: login(set, get),
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
  },
  reset: () => resetStore(initialState, set),
});

const useAuthStore = createStore<AuthState>(authStore);

export default useAuthStore;
