import { useContext } from 'react';

import { InstantSearchContext } from './InstantSearchContext';

export function useInstantSearchContext() {
  const context = useContext(InstantSearchContext);

  if (context === null) {
    throw new Error(
      'Hooks must be used inside the <InstantSearch> component.\n\n' +
        'They are not compatible with the `react-instantsearch-core` and `react-instantsearch-dom` packages, so make sure to use the <InstantSearch> component from `react-instantsearch-hooks`.'
    );
  }

  return context;
}
