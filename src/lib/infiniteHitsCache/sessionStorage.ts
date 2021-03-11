import { isEqual } from '../utils';
import { InfiniteHitsCache } from '../../connectors/infinite-hits/connectInfiniteHits';

function getStateWithoutPage(state) {
  const { page, ...rest } = state || {};
  return rest;
}

const KEY = 'ais.infiniteHits';

function hasSessionStorage() {
  return (
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined'
  );
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
          window.sessionStorage.getItem(KEY)
        );

        return cache && isEqual(cache.state, getStateWithoutPage(state))
          ? cache.hits
          : null;
      } catch (error) {
        if (error instanceof SyntaxError) {
          try {
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
