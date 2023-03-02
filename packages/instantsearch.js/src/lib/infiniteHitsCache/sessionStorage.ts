import { isEqual, safelyRunOnBrowser } from '../utils';

import type { InfiniteHitsCache } from '../../connectors/infinite-hits/connectInfiniteHits';
import type { PlainSearchParameters } from 'algoliasearch-helper';

function getStateWithoutPage(state: PlainSearchParameters) {
  const { page, ...rest } = state || {};
  return rest;
}

const KEY = 'ais.infiniteHits';

export default function createInfiniteHitsSessionStorageCache(): InfiniteHitsCache {
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
    write({ state, hits }) {
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
            hits,
          })
        );
      } catch (error) {
        // do nothing
      }
    },
  };
}
