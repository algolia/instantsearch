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
// The shim's React 16 and 17 fallback ignores the server snapshot, so using it
// here would not distinguish initial hydration from later provider children.
function useLegacyIsHydrated() {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSSRContext();
  const isServerRendered = serverContext !== null || ssrContext !== null;
  const isProviderHydrated = ssrContext?.hydrationCompleteRef?.current === true;
  const [isHydrated, setIsHydrated] = React.useState(
    !isServerRendered || isProviderHydrated
  );

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
