import React from 'react';

import { IndexContext } from './IndexContext';
import { InstantSearchContext } from './InstantSearchContext';
import { useInstantSearch } from './useInstantSearch';

import type { UseInstantSearchProps } from './useInstantSearch';

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
