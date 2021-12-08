import { useContext } from 'react';

import { IndexContext } from './IndexContext';

export function useIndexContext() {
  const context = useContext(IndexContext);

  if (context === null) {
    throw new Error(
      'The <Index> component must be used within <InstantSearch>.'
    );
  }

  return context;
}
