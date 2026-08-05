import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Router, UiState } from 'instantsearch.js';

const STORAGE_KEY = 'instantsearch-route-state';
const WRITE_DELAY = 400;

type AsyncStorageRouter<TRouteState> = Router<TRouteState> & {
  // Push external route state in (deep link, another screen, restored session).
  setRouteState: (routeState: TRouteState) => void;
};

/**
 * A React Native routing adapter for InstantSearch. The built-in history
 * router relies on `window.history` / URLs, which don't exist in React Native,
 * so this persists the UI state to AsyncStorage instead.
 *
 * `read()` is called synchronously when InstantSearch starts, so the state must
 * be hydrated ahead of time via `hydrateRouteState()` and passed in as
 * `initialRouteState`.
 */
export function createAsyncStorageRouter<TRouteState = UiState>({
  initialRouteState = {} as TRouteState,
  writeDelay = WRITE_DELAY,
}: {
  initialRouteState?: TRouteState;
  writeDelay?: number;
} = {}): AsyncStorageRouter<TRouteState> {
  let currentRouteState = initialRouteState;
  let onUpdateCallback: ((route: TRouteState) => void) | undefined;
  let writeTimer: ReturnType<typeof setTimeout> | undefined;
  let isDisposed = false;

  return {
    $$type: 'rn.asyncStorage',

    read() {
      return currentRouteState;
    },

    write(routeState) {
      if (isDisposed) {
        return;
      }
      currentRouteState = routeState;

      // Debounce writes like the built-in history router (default 400ms).
      if (writeTimer) {
        clearTimeout(writeTimer);
      }
      writeTimer = setTimeout(() => {
        writeTimer = undefined;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(routeState)).catch(
          () => {}
        );
      }, writeDelay);
    },

    onUpdate(callback) {
      onUpdateCallback = callback;
    },

    // React Native has no URLs; a deep-link string could be returned here.
    createURL() {
      return '';
    },

    start() {
      isDisposed = false;
    },

    dispose() {
      isDisposed = true;
      onUpdateCallback = undefined;
      if (writeTimer) {
        clearTimeout(writeTimer);
      }
      // Intentionally keep the persisted state so it survives unmount/remount.
    },

    setRouteState(routeState) {
      currentRouteState = routeState;
      // Mirrors a browser popstate: notify InstantSearch, which applies it via
      // `setUiState`. The router middleware's deep-equal check prevents the
      // resulting write from echoing back into a loop.
      onUpdateCallback?.(routeState);
    },
  };
}

export async function hydrateRouteState<
  TRouteState = UiState
>(): Promise<TRouteState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TRouteState) : ({} as TRouteState);
  } catch (error) {
    return {} as TRouteState;
  }
}
