import { isEqual, safelyRunOnBrowser } from '../public';

import type { InfiniteHitsCache } from '../../connectors/connectInfiniteHits';
import type { PlainSearchParameters } from 'algoliasearch-helper';

function getStateWithoutPage(state: PlainSearchParameters) {
  const { page, ...rest } = state || {};
  return rest;
}

export function createInfiniteHitsSessionStorageCache({
  key,
}: {
  /**
   * If you display multiple instances of infiniteHits on the same page,
   * you must provide a unique key for each instance.
   */
  key?: string;
} = {}): InfiniteHitsCache {
  const KEY = ['ais.infiniteHits', key].filter(Boolean).join(':');

  return {
    read({ state }) {
      const sessionStorage = safelyRunOnBrowser<Storage | undefined>(
        ({ window }) => window.sessionStorage
      );

      if (!sessionStorage) {
        return null;
      }

      try {
        const cache = JSON.parse(
          // @ts-expect-error JSON.parse() requires a string, but it actually accepts null, too.
          sessionStorage.getItem(KEY)
        );

        return cache && isEqual(cache.state, getStateWithoutPage(state))
          ? cache.hits
          : null;
      } catch (error) {
        if (error instanceof SyntaxError) {
          try {
            sessionStorage.removeItem(KEY);
          } catch (err) {
            // do nothing
          }
        }
        return null;
      }
    },
    write({ state, items }) {
      const sessionStorage = safelyRunOnBrowser<Storage | undefined>(
        ({ window }) => window.sessionStorage
      );

      if (!sessionStorage) {
        return;
      }

      try {
        sessionStorage.setItem(
          KEY,
          JSON.stringify({
            state: getStateWithoutPage(state),
            hits: items,
          })
        );
      } catch (error) {
        // do nothing
      }
    },
  };
}
