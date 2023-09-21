import { createContext } from 'react';

import type { PromiseWithState } from './wrapPromiseWithState';
import type { MutableRefObject } from 'react';

export type InstantSearchRSCContextApi =
  MutableRefObject<PromiseWithState<void> | null> | null;

export const InstantSearchRSCContext =
  createContext<InstantSearchRSCContextApi>(null);
