import type InstantSearch from './InstantSearch';
import { noop, safelyRunOnBrowser } from './utils';

// Simplified version for POC
function insightsLibraryDetected() {
  return safelyRunOnBrowser(({ window }) => {
    return Boolean(window[(window as any).AlgoliaAnalyticsObject]);
  });
}

function insightsMiddlewareDetected(instantSearchInstance: InstantSearch) {
  return instantSearchInstance.sendEventToInsights !== noop;
}

export function enableInsights(instantSearchInstance: InstantSearch) {
  // FIXME: How do we make sure the middleware is loaded in RISH before we go through this?
  console.log({
    libraryDetected: insightsLibraryDetected(),
    middlewareDetected: insightsMiddlewareDetected(instantSearchInstance),
    instantSearchInstance,
  });
}
