import { createContext } from 'react';

import type { Store } from '../core/createStore';
import type InstantSearch from '../widgets/InstantSearch';

export type InstantSearchContext = {
  onInternalStateUpdate: InstantSearch['onWidgetsInternalStateUpdate'];
  createHrefForState: InstantSearch['createHrefForState'];
  onSearchForFacetValues: InstantSearch['onSearchForFacetValues'];
  onSearchStateChange: InstantSearch['onSearchStateChange'];
  onSearchParameters: InstantSearch['onSearchParameters'];
  store: Store;
  widgetsManager: any;
  mainTargetedIndex: string;
};

export const instantSearchContext = createContext<InstantSearchContext>({
  onInternalStateUpdate: () => undefined,
  createHrefForState: () => '#',
  onSearchForFacetValues: () => undefined,
  onSearchStateChange: () => undefined,
  onSearchParameters: () => undefined,
  store: {} as Store,
  widgetsManager: {},
  mainTargetedIndex: '',
});

export const {
  Consumer: InstantSearchConsumer,
  Provider: InstantSearchProvider,
} = instantSearchContext;

export type IndexContext =
  | {
      targetedIndex: string;
    }
  | undefined;

export const { Consumer: IndexConsumer, Provider: IndexProvider } =
  createContext<IndexContext>(undefined);
