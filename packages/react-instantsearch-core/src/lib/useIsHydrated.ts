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
// effect and the render itself cannot tell hydration from a plain mount. These
// contexts provide that signal for the supported `getServerState` and
// `InstantSearchSSRProvider` flow: the server context covers state collection,
// and the SSR context covers HTML rendering and hydration.
//
// This can cost an extra render: a mount inside a provider that carries server
// state is withheld once even when there is no server markup to reproduce. A
// mount outside both contexts is never withheld.
//
// The shim's React 16 and 17 fallback ignores the server snapshot, so using it
// here would not change this limitation.
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
