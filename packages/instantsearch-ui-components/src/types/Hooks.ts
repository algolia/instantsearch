import type { MutableRef } from './Renderer';

/**
 * React/Preact hook and HOC primitives, supplied by the flavor wrapper.
 *
 * Used in components that need them as `Pick<Hooks, 'useState' | 'useEffect'>`.
 */
export type Hooks = {
  useState: UseState;
  useEffect: UseEffect;
  useRef: UseRef;
  useMemo: UseMemo;
  useCallback: UseCallback;
  useId: UseId;
  memo: Memo;
};

export type UseState = <TState>(
  initialState: TState
) => [TState, (value: TState | ((prev: TState) => TState)) => void];

export type UseEffect = (
  effect: () => void | (() => void),
  deps?: readonly unknown[]
) => void;

export type UseRef = <TValue>(initialValue: TValue) => MutableRef<TValue>;

export type UseMemo = <TValue>(
  factory: () => TValue,
  deps: readonly unknown[]
) => TValue;

export type UseCallback = <TCallback extends (...args: any[]) => any>(
  callback: TCallback,
  deps: readonly unknown[]
) => TCallback;

export type UseId = () => string;

export type Memo = <TProps>(
  component: (props: TProps) => JSX.Element,
  propsAreEqual?: (
    prevProps: Readonly<TProps>,
    nextProps: Readonly<TProps>
  ) => boolean
) => (props: TProps) => JSX.Element;
