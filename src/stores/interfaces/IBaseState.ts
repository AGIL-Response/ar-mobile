export interface IBaseState {
  reset?: () => void;
}

export type InitStateType<T> = Omit<T, 'actions' | 'reset'>

export default IBaseState;
