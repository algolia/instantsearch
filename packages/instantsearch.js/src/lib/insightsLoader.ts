import { createInsightsMiddleware } from '../middlewares';
import type InstantSearch from './InstantSearch';
import { noop, safelyRunOnBrowser } from './utils';

// Simplified version for POC
function getSearchInsightsVersion() {
  if (!insightsLibraryDetected()) return Promise.resolve('');

  return safelyRunOnBrowser(({ window }: { window: any }) => {
    const aa = window[window.AlgoliaAnalyticsObject];
    return new Promise<string>((resolve) => {
      aa('getVersion', (version: string) => resolve(version));
    });
  });
}

function getSearchInsightsMajorVersion() {
  return getSearchInsightsVersion().then(
    (version) => version && parseInt(version.split('.')[0], 10)
  );
}

function getSearchInsightsUserToken() {
  if (!insightsLibraryDetected()) return Promise.resolve('');

  return safelyRunOnBrowser(({ window }: { window: any }) => {
    const aa = window[window.AlgoliaAnalyticsObject];
    return new Promise<string>((resolve) => {
      aa('getUserToken', null, (_error: any, userToken: string) =>
        resolve(userToken)
      );
    });
  });
}

function shouldUseCookie() {
  return Promise.all([
    getSearchInsightsUserToken(),
    getSearchInsightsMajorVersion(),
  ]).then(
    ([userToken, majorVersion]) => userToken === undefined && majorVersion >= 2
  );
}

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
            window[window.AlgoliaAnalyticsObject].queue || []).push(args);
        };

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://cdn.jsdelivr.net/npm/search-insights@${version}/dist/search-insights.min.js`;

      const child = document.getElementsByTagName('script')[0];
      child.parentNode!.insertBefore(script, child);

      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
    });
  });
}

export function enableInsights(instantSearchInstance: InstantSearch) {
  safelyRunOnBrowser(({ window }: { window: any }) => {
    if (
      !insightsLibraryDetected() &&
      !insightsMiddlewareDetected(instantSearchInstance)
    ) {
      loadSearchInsights()
        .then(shouldUseCookie)
        .then((useCookie) => {
          instantSearchInstance.use(
            createInsightsMiddleware({
              insightsClient: window[window.AlgoliaAnalyticsObject],
              ...(useCookie && {
                insightsInitParams: { useCookie: true },
              }),
            })
          );
        });
    }
  });
}
