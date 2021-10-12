import instantsearch from 'instantsearch.js';
import { useEffect, useMemo, version as ReactVersion } from 'react';

import { useForceUpdate } from '../useForceUpdate';

import { useStableValue } from './useStableValue';
import { warn } from './utils';
import version from './version';

import type { InstantSearchOptions } from 'instantsearch.js';

export type UseInstantSearchProps = InstantSearchOptions & {
  /**
   * Removes the console warning about the experimental version.
   *
   * Note that this warning is only displayed in development mode.
   *
   * @default false
   */
  suppressExperimentalWarning?: boolean;
};

export function useInstantSearch({
  suppressExperimentalWarning = false,
  ...props
}: UseInstantSearchProps) {
  const stableProps = useStableValue(props);
  const search = useMemo(() => instantsearch(stableProps), [stableProps]);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    warn(
      suppressExperimentalWarning,
      'This version is experimental and not production-ready.\n\n' +
        'Please report any bugs at https://github.com/algolia/react-instantsearch/issues/new\n\n' +
        '(To disable this warning, pass `suppressExperimentalWarning` to <InstantSearch />.)'
    );
  }, [suppressExperimentalWarning]);

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
