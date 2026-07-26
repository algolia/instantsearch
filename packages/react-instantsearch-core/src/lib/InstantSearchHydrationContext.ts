import { createContext } from 'react';

export const InstantSearchHydrationContext = createContext(true);

if (__DEV__) {
  InstantSearchHydrationContext.displayName = 'InstantSearchHydration';
}
