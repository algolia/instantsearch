import type InstantSearch from './InstantSearch';
import { noop, safelyRunOnBrowser } from './utils';

// Simplified version for POC
function insightsLibraryDetected() {
  return safelyRunOnBrowser<boolean>(({ window }) => {
    return Boolean(window[(window as any).AlgoliaAnalyticsObject]);
  });
}

function insightsMiddlewareDetected(instantSearchInstance: InstantSearch) {
  return instantSearchInstance.sendEventToInsights !== noop;
}

function loadSearchInsights(version = '2.2.3') {
  if (insightsLibraryDetected()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Casting window as any because the modified interface from search-insights is not compatible with the documented script snippet
    safelyRunOnBrowser(({ window }: { window: any }) => {
      window.AlgoliaAnalyticsObject = 'aa';
      window[window.AlgoliaAnalyticsObject] =
        window[window.AlgoliaAnalyticsObject] ||
        function (...args: any[]) {
          (window[window.AlgoliaAnalyticsObject].queue =
            window[window.AlgoliaAnalyticsObject].queue || []).push(...args);
        };

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://cdn.jsdelivr.net/npm/search-insights@${version}`;

      const child = document.getElementsByTagName('script')[0];
      child.parentNode!.insertBefore(script, child);

      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
    });
  });
}

export function enableInsights(instantSearchInstance: InstantSearch) {
  if (
    !insightsLibraryDetected() &&
    !insightsMiddlewareDetected(instantSearchInstance)
  ) {
    loadSearchInsights();
  }
}
