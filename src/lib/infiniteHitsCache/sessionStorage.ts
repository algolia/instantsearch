import type { PlainSearchParameters } from 'algoliasearch-helper';
import { isEqual, safelyRunOnBrowser } from '../utils';
import type { InfiniteHitsCache } from '../../connectors/infinite-hits/connectInfiniteHits';

function getStateWithoutPage(state: PlainSearchParameters) {
  const { page, ...rest } = state || {};
  return rest;
}

const KEY = 'ais.infiniteHits';

function hasSessionStorage() {
  return safelyRunOnBrowser(({ window }) => Boolean(window.sessionStorage), {
    fallback: () => false,
  });
}

export default function createInfiniteHitsSessionStorageCache(): InfiniteHitsCache {
  return {
    read({ state }) {
      if (!hasSessionStorage()) {
        return null;
      }

      try {
        const cache = JSON.parse(
          // @ts-expect-error JSON.parse() requires a string, but it actually accepts null, too.
          // We're in a browser environment at this point.
          // eslint-disable-next-line no-restricted-globals
          window.sessionStorage.getItem(KEY)
        );

        return cache && isEqual(cache.state, getStateWithoutPage(state))
          ? cache.hits
          : null;
      } catch (error) {
        if (error instanceof SyntaxError) {
          try {
            // We're in a browser environment at this point.
            // eslint-disable-next-line no-restricted-globals
            window.sessionStorage.removeItem(KEY);
          } catch (err) {
            // do nothing
          }
        }
        return null;
      }
    },
    write({ state, hits }) {
      if (!hasSessionStorage()) {
        return;
      }

      try {
        // We're in a browser environment at this point.
        // eslint-disable-next-line no-restricted-globals
        window.sessionStorage.setItem(
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
