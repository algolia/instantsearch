import { useContext } from 'react';

import { InstantSearchContext } from './InstantSearchContext';

export function useInstantSearchContext() {
  const context = useContext(InstantSearchContext);

  if (context === null) {
    throw new Error(
      '`useInstantSearchContext` must be used within `InstantSearchContext.Provider`.'
    );
  }

  return context;
}
