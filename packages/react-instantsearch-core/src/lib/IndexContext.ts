import { createContext } from 'react';

import type { IndexWidget } from 'instantsearch-core';

export const IndexContext = createContext<IndexWidget | null>(null);

if (__DEV__) {
  IndexContext.displayName = 'Index';
}
