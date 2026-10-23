import { instantsearchBase } from 'instantsearch.js/es/lib/InstantSearchBase';
import React, { useCallback, useRef, version as ReactVersion } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { IndexContext } from '../lib/IndexContext';
import { InstantSearchContext } from '../lib/InstantSearchContext';
import { useForceUpdate } from '../lib/useForceUpdate';
import version from '../version';

import type { InstantSearch as InstantSearchType } from 'instantsearch.js';
import type {
  InstantSearchBase as InstantSearchBaseInstance,
  InstantSearchBaseOptions,
} from 'instantsearch.js/es/lib/InstantSearchBase';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

const defaultUserAgents = [
  `react (${ReactVersion})`,
  `react-instantsearch (${version})`,
  `react-instantsearch-core (${version})`,
];

type InternalInstantSearchBase = InstantSearchBaseInstance & {
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

export type InstantSearchBaseProps = InstantSearchBaseOptions & {
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
export function InstantSearchBase({
  children,
  ...options
}: InstantSearchBaseProps) {
  const base = useInstantSearchBaseApi(options as InstantSearchBaseOptions);

  if (!base.started) {
    return null;
  }

  return (
    <InstantSearchContext.Provider value={base as unknown as InstantSearchType}>
      <IndexContext.Provider value={base.mainIndex}>
        {children}
      </IndexContext.Provider>
    </InstantSearchContext.Provider>
  );
}

function useInstantSearchBaseApi(options: InstantSearchBaseOptions) {
  const forceUpdate = useForceUpdate();
  const baseRef = useRef<InternalInstantSearchBase | null>(null);

  if (baseRef.current === null) {
    const { searchClient } = options;
    if (
      'addAlgoliaAgent' in searchClient &&
      typeof searchClient.addAlgoliaAgent === 'function'
    ) {
      defaultUserAgents.forEach((userAgent) => {
        searchClient.addAlgoliaAgent!(userAgent);
      });
    }

    const base = instantsearchBase(options) as InternalInstantSearchBase;

    base._schedule = function _schedule(cb: () => void) {
      base._schedule.queue.push(cb);

      clearTimeout(base._schedule.timer);
      base._schedule.timer = setTimeout(() => {
        base._schedule.queue.forEach((callback) => {
          callback();
        });
        base._schedule.queue = [];
      }, 0);
    } as typeof base._schedule;
    base._schedule.queue = [];

    baseRef.current = base;
  }

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useSyncExternalStore<InternalInstantSearchBase>(
    useCallback(() => {
      const base = baseRef.current!;

      // Scenario 1: the component mounts.
      if (cleanupTimerRef.current === null) {
        if (!base.started) {
          base.start();
          forceUpdate();
        }
      }
      // Scenario 2: the component updates. We cancel the previous cleanup
      // function because we don't want to dispose the base during an
      // update.
      else {
        clearTimeout(cleanupTimerRef.current);
        base._preventWidgetCleanup = false;
      }

      return () => {
        clearTimeout(base._schedule.timer);
        // Executing the cleanup function in a `setTimeout()` lets us cancel it
        // in the next effect, so that Strict Mode doesn't dispose the base.
        cleanupTimerRef.current = setTimeout(() => {
          base.dispose();
        });
        // The widgets are disposed along with the base, not one by one.
        base._preventWidgetCleanup = true;
      };
    }, [forceUpdate]),
    () => baseRef.current!,
    () => baseRef.current!
  );
}
