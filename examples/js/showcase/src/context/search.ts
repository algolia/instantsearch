import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

import type instantsearch from 'instantsearch.js';

export const SearchContext = createContext<ReturnType<typeof instantsearch>>(
  null!
);

export function useSearch() {
  return useContext(SearchContext);
}
