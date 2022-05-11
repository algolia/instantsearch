import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';
import { useEffect, useMemo, version as ReactVersion } from 'react';

import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';
import { useInstantSearchSSRContext } from '../lib/useInstantSearchSSRContext';
import version from '../version';

import { useForceUpdate } from './useForceUpdate';
import { useStableValue } from './useStableValue';

import type { InstantSearchServerContextApi } from '../components/InstantSearchServerContext';
import type { InstantSearchServerState } from '../components/InstantSearchSSRProvider';
import type {
  InstantSearchOptions,
  SearchClient,
  UiState,
} from 'instantsearch.js';

const defaultUserAgents = [
  `react (${ReactVersion})`,
  `react-instantsearch (${version})`,
  `react-instantsearch-hooks (${version})`,
];

export type UseInstantSearchProps<
  TUiState extends UiState,
  TRouteState
> = InstantSearchOptions<TUiState, TRouteState>;

export function useInstantSearch<TUiState extends UiState, TRouteState>(
  props: UseInstantSearchProps<TUiState, TRouteState>
) {
  const serverContext = useInstantSearchServerContext();
  const serverState = useInstantSearchSSRContext();
  const stableProps = useStableValue(props);
  const search = useMemo(
    () =>
      serverAdapter(
        new InstantSearch(stableProps),
        stableProps,
        serverContext,
        serverState
      ),
    [stableProps, serverContext, serverState]
  );
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    addAlgoliaAgents(stableProps.searchClient, defaultUserAgents);
  }, [stableProps.searchClient]);

  useEffect(() => {
    // On SSR, the instance is already started so we don't start it again here.
    if (!search.started) {
      search.start();
      forceUpdate();
    }

    return () => {
      search.dispose();
    };
  }, [search, serverState, forceUpdate]);

  return search;
}

function serverAdapter<TUiState extends UiState, TRouteState>(
  search: InstantSearch,
  props: UseInstantSearchProps<TUiState, TRouteState>,
  serverContext: InstantSearchServerContextApi | null,
  serverState: Partial<InstantSearchServerState> | null
): InstantSearch<TUiState, TRouteState> {
  const initialResults = serverState?.initialResults;

  if (serverContext || initialResults) {
    // InstantSearch.js has a private Initial Results API that lets us inject
    // results on the search instance.
    // On the server, we default the initial results to an empty object so that
    // InstantSearch.js doesn't schedule a search that isn't used, leading to
    // an additional network request. (This is equivalent to monkey-patching
    // `scheduleSearch` to a noop.)
    search._initialResults = initialResults || {};
    // On the server, we start the search early to compute the search parameters.
    // On SSR, we start the search early to directly catch up with the lifecycle
    // and render.
    search.start();
  }

  if (serverContext) {
    // On the browser, we add user agents in an effect. Since effects are not
    // run on the server, we need to add user agents directly here.
    addAlgoliaAgents(props.searchClient, [
      ...defaultUserAgents,
      `react-instantsearch-server (${version})`,
    ]);

    // We notify `getServerState()` of the InstantSearch internals to retrieve
    // the server state and pass it to the render on SSR.
    serverContext.notifyServer({ search });
  }

  return search;
}

function addAlgoliaAgents(searchClient: SearchClient, userAgents: string[]) {
  if (typeof searchClient.addAlgoliaAgent !== 'function') {
    return;
  }

  userAgents.forEach((userAgent) => {
    searchClient.addAlgoliaAgent!(userAgent);
  });
}
