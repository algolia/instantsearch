import * as React from 'react';

import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSSRContext } from './useInstantSearchSSRContext';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useNativeIsHydrated() {
  return React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}

// React 16 and 17 have no `useSyncExternalStore`, so the flip waits for an
// effect and the render itself cannot tell hydration from a plain mount. Being
// inside one of the two server-rendering contexts stands in for that signal, and
// between them they cover every render the SSR flow performs: the pass that
// collects server state provides the server context, and the pass that produces
// the HTML provides the SSR context, as does the browser hydrating that HTML.
//
// The signal is still inexact, in the direction that costs a render rather than
// correctness. An app that never server renders is in neither context and is
// never withheld, so it behaves as it does without this hook; but a mount inside
// a provider that carries server state is withheld for one render even long
// after hydration, when there is no server markup left to reproduce.
//
// Reusing the repository's `use-sync-external-store` shim would not help, since
// it ignores the server snapshot and reports a hydration render as hydrated.
function useLegacyIsHydrated() {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSSRContext();
  const isServerRendered = serverContext !== null || ssrContext !== null;
  const [isHydrated, setIsHydrated] = React.useState(!isServerRendered);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Whether this render can use browser state, or has to reproduce the markup a
 * server produced without it.
 *
 * @internal
 */
export const useIsHydrated =
  typeof React.useSyncExternalStore === 'function'
    ? useNativeIsHydrated
    : useLegacyIsHydrated;
