import * as React from 'react';

import { InstantSearchHydrationContext } from './InstantSearchHydrationContext';

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

function useLegacyIsHydrated() {
  return React.useContext(InstantSearchHydrationContext);
}

export const useIsHydrated =
  typeof React.useSyncExternalStore === 'function'
    ? useNativeIsHydrated
    : useLegacyIsHydrated;
