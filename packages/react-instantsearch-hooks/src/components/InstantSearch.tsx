import React from 'react';

import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useInstantSearch } from '../lib/useInstantSearch';

import type { UseInstantSearchProps } from '../lib/useInstantSearch';

export type InstantSearchProps = UseInstantSearchProps & {
  children?: React.ReactNode;
};

export function InstantSearch({ children, ...props }: InstantSearchProps) {
  const search = useInstantSearch(props);

  if (!search.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider value={search}>
      <IndexContext.Provider value={search.mainIndex}>
        {children}
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
  );
}
