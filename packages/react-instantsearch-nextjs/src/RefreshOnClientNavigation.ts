import { useEffect, useRef } from 'react';
import { useInstantSearchContext } from 'react-instantsearch-core';

// Fallback store for the first location an `InstantSearchNext` instance
// rendered with, used only in environments without the Navigation Timing API
// (e.g. jsdom in tests). See `getInitialLocation` below.
const InstantSearchDocumentLocation = Symbol.for(
  'InstantSearchDocumentLocation'
);
declare global {
  interface Window {
    [InstantSearchDocumentLocation]?: string;
  }
}

/**
 * The `pathname` + `search` the document was initially loaded with.
 *
 * It comes from the Navigation Timing API, which reflects the hard page load
 * and is *not* affected by client-side (SPA) navigations. The hash is ignored
 * as it isn't part of the routing state. Falls back to the first location any
 * instance rendered with (stored on `window`) when Navigation Timing is
 * unavailable.
 */
function getInitialLocation(currentLocation: string): string {
  try {
    const [entry] = performance.getEntriesByType('navigation');
    if (entry && entry.name) {
      const url = new URL(entry.name);
      return url.pathname + url.search;
    }
  } catch (e) {
    // Navigation Timing not available; fall through to the `window` fallback.
  }

  if (window[InstantSearchDocumentLocation] === undefined) {
    window[InstantSearchDocumentLocation] = currentLocation;
  }
  return window[InstantSearchDocumentLocation];
}

/**
 * Whether the current location differs from the one the document was initially
 * loaded with — i.e. whether we reached this render through a client-side (SPA)
 * navigation rather than the initial hydration.
 */
export function isClientNavigation(): boolean {
  const currentLocation = window.location.pathname + window.location.search;
  return getInitialLocation(currentLocation) !== currentLocation;
}

/**
 * Refreshes the search after a client-side navigation.
 *
 * On a client-side navigation the App Router remounts `InstantSearchNext` with
 * the server-streamed `initialResults`, which can be empty (e.g. coming from a
 * page without InstantSearch) or stale, and the instance doesn't search again
 * on its own — leaving the new page with no or outdated hits until a full
 * reload (#7060). When we detect such a navigation we refresh the search so it
 * re-fetches with the (already correct) current UI state.
 *
 * Unlike re-running the router's `onUpdate`, `refresh()` doesn't touch the URL,
 * so it can't wipe the URL of a nested `<Index>` whose children only register
 * on a second render pass (#6980).
 */
export function RefreshOnClientNavigation() {
  const search = useInstantSearchContext();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (hasRefreshed.current) {
      return;
    }
    hasRefreshed.current = true;

    if (search.started && isClientNavigation()) {
      search.refresh();
    }
  }, [search]);

  return null;
}
