import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';
import { useCallback, useRef, version as ReactVersion } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';
import { useInstantSearchSSRContext } from '../lib/useInstantSearchSSRContext';
import version from '../version';

import { useForceUpdate } from './useForceUpdate';
import { warn } from './warn';

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
const serverUserAgent = `react-instantsearch-server (${version})`;

export type UseInstantSearchApiProps<
  TUiState extends UiState,
  TRouteState
> = InstantSearchOptions<TUiState, TRouteState>;

export function useInstantSearchApi<TUiState extends UiState, TRouteState>(
  props: UseInstantSearchApiProps<TUiState, TRouteState>
) {
  const forceUpdate = useForceUpdate();
  const serverContext = useInstantSearchServerContext<TUiState, TRouteState>();
  const serverState = useInstantSearchSSRContext<TUiState, TRouteState>();
  const initialResults = serverState?.initialResults;
  const prevPropsRef = useRef(props);

  let searchRef = useRef<InstantSearch<TUiState, TRouteState> | null>(null);
  // As we need to render on mount with SSR, using the local ref above in `StrictMode` will
  // create and start two instances of InstantSearch. To avoid this, we instead discard it and use
  // an upward ref from `InstantSearchSSRContext` as it has already been mounted a second time at this point.
  if (serverState) {
    searchRef = serverState.ssrSearchRef;
  }

  if (searchRef.current === null) {
    // We don't use the `instantsearch()` function because it comes with other
    // top-level APIs that we don't need.
    // See https://github.com/algolia/instantsearch.js/blob/5b529f43d8acc680f85837eaaa41f7fd03a3f833/src/index.es.ts#L63-L86
    const search = new InstantSearch(props);

    if (serverContext || initialResults) {
      // InstantSearch.js has a private Initial Results API that lets us inject
      // results on the search instance.
      // On the server, we default the initial results to an empty object so that
      // InstantSearch.js doesn't schedule a search that isn't used, leading to
      // an additional network request. (This is equivalent to monkey-patching
      // `scheduleSearch` to a noop.)
      search._initialResults = initialResults || {};
    }

    addAlgoliaAgents(props.searchClient, [
      ...defaultUserAgents,
      serverContext && serverUserAgent,
    ]);

    // On the server, we start the search early to compute the search parameters.
    // On SSR, we start the search early to directly catch up with the lifecycle
    // and render.
    if (serverContext || initialResults) {
      search.start();
    }

    if (serverContext) {
      // We notify `getServerState()` of the InstantSearch internals to retrieve
      // the server state and pass it to the render on SSR.
      serverContext.notifyServer({ search });
    }

    warnNextRouter(props.routing);

    searchRef.current = search;
  }

  {
    const search = searchRef.current;
    const prevProps = prevPropsRef.current;

    if (prevProps.indexName !== props.indexName) {
      search.helper!.setIndex(props.indexName).search();
      prevPropsRef.current = props;
    }

    if (prevProps.searchClient !== props.searchClient) {
      warn(
        false,
        'The `searchClient` prop of `<InstantSearch>` changed between renders, which may cause more search requests than necessary. If this is an unwanted behavior, please provide a stable reference: https://www.algolia.com/doc/api-reference/widgets/instantsearch/react-hooks/#widget-param-searchclient'
      );

      addAlgoliaAgents(props.searchClient, [
        ...defaultUserAgents,
        serverContext && serverUserAgent,
      ]);
      search.mainHelper!.setClient(props.searchClient).search();
      prevPropsRef.current = props;
    }

    if (prevProps.onStateChange !== props.onStateChange) {
      search.onStateChange = props.onStateChange;
      prevPropsRef.current = props;
    }

    if (prevProps.searchFunction !== props.searchFunction) {
      // Updating the `searchFunction` to `undefined` is not supported by
      // InstantSearch.js, so it will throw an error.
      // This is a fair behavior until we add an update API in InstantSearch.js.
      search._searchFunction = props.searchFunction;
      prevPropsRef.current = props;
    }

    if (prevProps.stalledSearchDelay !== props.stalledSearchDelay) {
      // The default `stalledSearchDelay` in InstantSearch.js is 200ms.
      // We need to reset it when it's undefined to get back to the original value.
      search._stalledSearchDelay = props.stalledSearchDelay ?? 200;
      prevPropsRef.current = props;
    }

    // Updating the `routing` prop is not supported because InstantSearch.js
    // doesn't let us change it. This might not be a problem though, because `routing`
    // shouldn't need to be dynamic.
    // If we find scenarios where `routing` needs to change, we can always expose
    // it privately on the InstantSearch instance. Another way would be to
    // manually inject the routing middleware in this library, and not rely
    // on the provided `routing` prop.
  }

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const store = useSyncExternalStore<InstantSearch<TUiState, TRouteState>>(
    useCallback(() => {
      const search = searchRef.current!;

      // Scenario 1: the component mounts.
      if (cleanupTimerRef.current === null) {
        // On SSR, the instance is already started so we don't start it again.
        if (!search.started) {
          search.start();
          forceUpdate();
        }
      }
      // Scenario 2: the component updates.
      else {
        // We cancel the previous cleanup function because we don't want to
        // dispose the search during an update.
        clearTimeout(cleanupTimerRef.current);
        (search as any)._preventWidgetCleanup = false;
      }

      return () => {
        function cleanup() {
          search.dispose();
        }

        // We clean up only when the component that uses this subscription unmounts,
        // but not when it updates, because it would dispose the instance, which
        // would remove all the widgets and break routing.
        // Executing the cleanup function in a `setTimeout()` lets us cancel it
        // in the next effect.
        // (There might be better ways to do this.)
        cleanupTimerRef.current = setTimeout(cleanup);

        // We need to prevent the `useWidget` cleanup function so that widgets
        // are not removed before the instance is disposed, triggering
        // an unwanted search request.
        (search as any)._preventWidgetCleanup = true;
      };
    }, [forceUpdate]),
    () => searchRef.current!,
    () => searchRef.current!
  );

  return store;
}

function addAlgoliaAgents(
  searchClient: SearchClient,
  userAgents: Array<string | null>
) {
  if (typeof searchClient.addAlgoliaAgent !== 'function') {
    return;
  }

  userAgents.filter(Boolean).forEach((userAgent) => {
    searchClient.addAlgoliaAgent!(userAgent!);
  });
}

function warnNextRouter<TUiState extends UiState, TRouteState>(
  routing: UseInstantSearchApiProps<TUiState, TRouteState>['routing']
) {
  if (__DEV__) {
    if (
      !routing ||
      typeof window === 'undefined' ||
      !('__NEXT_DATA__' in window)
    ) {
      return;
    }

    const isUsingNextRouter =
      // @ts-expect-error: _isNextRouter is only set on the Next.js router
      routing !== true && routing?.router?._isNextRouter;

    warn(
      isUsingNextRouter,
      `
You are using Next.js with InstantSearch without the "react-instantsearch-hooks-router-nextjs" package.
This package is recommended to make the routing work correctly with Next.js.
Please check its usage instructions: https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch-hooks-router-nextjs

You can ignore this warning if you are using a custom router that suits your needs, it won't be outputted in production builds.`
    );
  }
}
