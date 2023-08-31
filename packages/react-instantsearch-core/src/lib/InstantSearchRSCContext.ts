import { createContext } from 'react';

import type { PromiseWithState } from './wrapPromiseWithState';
import type { MutableRefObject } from 'react';

export type InstantSearchRSCContextApi = {
  promiseRef: MutableRefObject<PromiseWithState<void> | null>;
  insertHTML(callbacks: () => React.ReactNode): void;
};

export const InstantSearchRSCContext =
  createContext<InstantSearchRSCContextApi>({
    promiseRef: { current: null },
    insertHTML: () => {},
  });
