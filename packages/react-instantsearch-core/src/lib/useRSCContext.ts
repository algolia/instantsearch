import React from 'react';

import type { PromiseWithState } from './wrapPromiseWithState';
import type { MutableRefObject } from 'react';

export type ServerInsertedHTMLHook = (callbacks: () => React.ReactNode) => void;

export type InstantSearchRSCContextValue = {
  promiseRef: MutableRefObject<PromiseWithState<void> | null>;
  insertHTML: ServerInsertedHTMLHook;
};

export const InstantSearchRSCContext =
  React.createContext<InstantSearchRSCContextValue>({
    promiseRef: { current: null },
    insertHTML: () => {},
  });

export function useRSCContext() {
  return React.useContext(InstantSearchRSCContext);
}
