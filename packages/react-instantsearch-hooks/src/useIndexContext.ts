import { useContext } from 'react';

import { IndexContext } from './IndexContext';

export function useIndexContext() {
  const context = useContext(IndexContext);

  if (context === null) {
    throw new Error(
      '`useIndexContext` must be used within `IndexContext.Provider`.'
    );
  }

  return context;
}
