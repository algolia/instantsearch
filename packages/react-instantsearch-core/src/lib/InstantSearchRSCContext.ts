import { createContext } from 'react';

import type { PromiseWithState } from './wrapPromiseWithState';
import type { RefObject } from 'react';

export type InstantSearchRSCContextApi = {
  waitForResultsRef: RefObject<PromiseWithState<void> | null> | null;
  countRef: RefObject<number>;
};

export const InstantSearchRSCContext =
  createContext<InstantSearchRSCContextApi>({
    countRef: { current: 0 },
    waitForResultsRef: null,
  });
