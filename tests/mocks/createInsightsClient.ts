import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import {
  AlgoliaAnalytics,
  processQueue,
  getFunctionalInterface,
} from 'search-insights';

import type { InsightsClient } from 'instantsearch.js';

/**
 * Tests that rely on this mock interface have side effects caused by
 * the import of search-insights. The following code deletes those side effects.
 */
try {
  delete window.AlgoliaAnalyticsObject;
} catch (error) {} // eslint-disable-line no-empty

export function createInsights<TVersion extends string | undefined = '2.17.2'>({
  forceVersion = '2.17.2',
}: {
  forceVersion?: TVersion;
} = {}) {
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: vi.fn(),
    })
  );
  const mockedInsightsClient = castToJestMock(
    vi.fn(getFunctionalInterface(analytics)) as InsightsClient
  );

  if (forceVersion) {
    return {
      analytics,
      insightsClient: Object.assign(mockedInsightsClient, {
        version: forceVersion,
      }),
    };
  }

  return {
    analytics,
    insightsClient: mockedInsightsClient,
  };
}

export function createInsightsUmdVersion() {
  const globalObject: {
    AlgoliaAnalyticsObject: 'aa';
    aa?: InsightsClient;
  } = {
    AlgoliaAnalyticsObject: 'aa',
  };

  globalObject.aa = (methodName, ...args) => {
    globalObject.aa!.queue = globalObject.aa!.queue || [];
    // @ts-expect-error TypeScript loses track of the exact tuple type when the array gets recreated
    globalObject.aa!.queue.push([methodName, ...args]);
  };
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: vi.fn(),
    })
  );

  return {
    analytics,
    insightsClient: globalObject.aa,
    libraryLoadedAndProcessQueue: () => {
      processQueue.call(analytics, globalObject);
    },
  };
}

function mockMethods(analytics: AlgoliaAnalytics) {
  analytics.addAlgoliaAgent = vi.fn(analytics.addAlgoliaAgent);

  analytics.viewedFilters = vi.fn(analytics.viewedFilters);
  analytics.viewedObjectIDs = vi.fn(analytics.viewedObjectIDs);
  analytics.clickedFilters = vi.fn(analytics.clickedFilters);
  analytics.clickedObjectIDs = vi.fn(analytics.clickedObjectIDs);
  analytics.clickedObjectIDsAfterSearch = vi.fn(
    analytics.clickedObjectIDsAfterSearch
  );
  analytics.convertedFilters = vi.fn(analytics.convertedFilters);
  analytics.convertedObjectIDs = vi.fn(analytics.convertedObjectIDs);
  analytics.convertedObjectIDsAfterSearch = vi.fn(
    analytics.convertedObjectIDsAfterSearch
  );
  return analytics;
}
