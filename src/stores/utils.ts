import {
  persist,
  PersistOptions,
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand';

interface ICreateZustand {
  persist?: PersistOptions<any>;
}

const createStore = <T>(store: any, options?: ICreateZustand) => {
  let _store: any = immer(store);
  if (options?.persist) {
    _store = persist(_store, options.persist);
  }
  return create<T>(_store);
};

const resetStore = (initState: any, set: any) => {
  set((state: any) => {
    Object.keys(initState).forEach((k) => {
      state[k] = initState[k];
    });
  });
};

export {
  createStore,
  resetStore,
};
