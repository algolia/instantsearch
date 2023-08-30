'use client';

import { createContext } from 'react';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export const IndexContext = createContext<IndexWidget | null>(null);

if (__DEV__) {
  IndexContext.displayName = 'Index';
}
