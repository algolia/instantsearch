import { createContext } from 'react';

import type { PromiseWithState } from './wrapPromiseWithState';
import type { InitialResults } from 'instantsearch.js';
import type { MutableRefObject } from 'react';

export type InstantSearchRSCContextApi =
  MutableRefObject<PromiseWithState<InitialResults | null> | null> | null;

export const InstantSearchRSCContext =
  createContext<InstantSearchRSCContextApi>(null);
