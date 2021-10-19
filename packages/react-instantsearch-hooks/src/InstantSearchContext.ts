import { createContext } from 'react';

import type { InstantSearch } from 'instantsearch.js';

export const InstantSearchContext = createContext<InstantSearch | null>(null);

if (__DEV__) {
  InstantSearchContext.displayName = 'InstantSearch';
}
