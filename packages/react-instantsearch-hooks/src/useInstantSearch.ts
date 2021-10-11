import instantsearch from 'instantsearch.js';
import { useEffect, useMemo, version as ReactVersion } from 'react';

import { useForceUpdate } from '../useForceUpdate';

import { useStableValue } from './useStableValue';
import version from './version';

import type { InstantSearchOptions } from 'instantsearch.js';

export type UseInstantSearchProps = InstantSearchOptions;

export function useInstantSearch(props: UseInstantSearchProps) {
  const stableProps = useStableValue(props);
  const search = useMemo(() => instantsearch(stableProps), [stableProps]);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (typeof stableProps.searchClient.addAlgoliaAgent === 'function') {
      stableProps.searchClient.addAlgoliaAgent(`react (${ReactVersion})`);
      stableProps.searchClient.addAlgoliaAgent(
        `react-instantsearch (${version})`
      );
      stableProps.searchClient.addAlgoliaAgent(
        `react-instantsearch-hooks (${version})`
      );
    }
  }, [stableProps.searchClient]);

  useEffect(() => {
    search.start();
    forceUpdate();

    return () => {
      search.dispose();
      forceUpdate();
    };
  }, [search, forceUpdate]);

  return search;
}
