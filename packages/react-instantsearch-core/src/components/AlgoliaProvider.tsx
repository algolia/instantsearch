import { createAlgoliaProvider } from 'instantsearch.js/es/lib/AlgoliaProvider';
import React, { useCallback, useRef, version as ReactVersion } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useForceUpdate } from '../lib/useForceUpdate';
import version from '../version';

import type { InstantSearch as InstantSearchType } from 'instantsearch.js';
import type {
  AlgoliaProvider as AlgoliaProviderInstance,
  AlgoliaProviderOptions,
} from 'instantsearch.js/es/lib/AlgoliaProvider';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

const defaultUserAgents = [
  `react (${ReactVersion})`,
  `react-instantsearch (${version})`,
  `react-instantsearch-core (${version})`,
];

type InternalAlgoliaProvider = AlgoliaProviderInstance & {
  mainIndex: IndexWidget;
  /**
   * Schedule a function to be called on the next timer tick
   * @private
   */
  _schedule: {
    (cb: () => void): void;
    queue: Array<() => void>;
    timer: ReturnType<typeof setTimeout> | undefined;
  };
  /**
   * Used inside useWidget, which ensures that removeWidgets is not called.
   * @private
   */
  _preventWidgetCleanup?: boolean;
};

export type AlgoliaProviderProps = AlgoliaProviderOptions & {
  children?: React.ReactNode;
};

/**
 * The equivalent of `<InstantSearch>` for widgets that don't search, like
 * `<Chat>` and `<ChatTrigger>`: it provides the credentials and the instance
 * the hooks read, without ever searching, and without the search helper.
 *
 * Middleware, like Insights, is added with `useInstantSearch().addMiddlewares`.
 *
 * Server-side rendering isn't supported: nothing renders on the server.
 */
export function AlgoliaProvider({
  children,
  ...options
}: AlgoliaProviderProps) {
  const provider = useAlgoliaProviderApi(options as AlgoliaProviderOptions);

  if (!provider.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider
      value={provider as unknown as InstantSearchType}
    >
      <IndexContext.Provider value={provider.mainIndex}>
        {children}
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
  );
}

function useAlgoliaProviderApi(options: AlgoliaProviderOptions) {
  const forceUpdate = useForceUpdate();
  const providerRef = useRef<InternalAlgoliaProvider | null>(null);

  if (providerRef.current === null) {
    const searchClient =
      'searchClient' in options ? options.searchClient : undefined;
    if (typeof searchClient?.addAlgoliaAgent === 'function') {
      defaultUserAgents.forEach((userAgent) => {
        searchClient.addAlgoliaAgent!(userAgent);
      });
    }

    const provider = createAlgoliaProvider({
      algoliaAgent: defaultUserAgents.join('; '),
      ...options,
    }) as InternalAlgoliaProvider;

    provider._schedule = function _schedule(cb: () => void) {
      provider._schedule.queue.push(cb);

      clearTimeout(provider._schedule.timer);
      provider._schedule.timer = setTimeout(() => {
        provider._schedule.queue.forEach((callback) => {
          callback();
        });
        provider._schedule.queue = [];
      }, 0);
    } as typeof provider._schedule;
    provider._schedule.queue = [];

    providerRef.current = provider;
  }

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useSyncExternalStore<InternalAlgoliaProvider>(
    useCallback(() => {
      const provider = providerRef.current!;

      // Scenario 1: the component mounts.
      if (cleanupTimerRef.current === null) {
        if (!provider.started) {
          provider.start();
          forceUpdate();
        }
      }
      // Scenario 2: the component updates. We cancel the previous cleanup
      // function because we don't want to dispose the provider during an
      // update.
      else {
        clearTimeout(cleanupTimerRef.current);
        provider._preventWidgetCleanup = false;
      }

      return () => {
        clearTimeout(provider._schedule.timer);
        // Executing the cleanup function in a `setTimeout()` lets us cancel it
        // in the next effect, so that Strict Mode doesn't dispose the provider.
        cleanupTimerRef.current = setTimeout(() => {
          provider.dispose();
        });
        // The widgets are disposed along with the provider, not one by one.
        provider._preventWidgetCleanup = true;
      };
    }, [forceUpdate]),
    () => providerRef.current!,
    () => providerRef.current!
  );
}
