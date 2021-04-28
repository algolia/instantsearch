import AlgoliaAnalytics from 'search-insights/lib/insights';
import { processQueue } from 'search-insights/lib/_processQueue';
import { getFunctionalInterface } from 'search-insights/lib/_getFunctionalInterface';

export function createInsights() {
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: jest.fn(),
    })
  );
  const insightsClient = jest.fn(getFunctionalInterface(analytics));

  return {
    analytics,
    insightsClient,
  };
}

export function createInsightsUmdVersion() {
  const globalObject: any = {};
  globalObject.AlgoliaAnalyticsObject = 'aa';
  globalObject.aa = (...args) => {
    globalObject.aa.queue = globalObject.aa.queue || [];
    globalObject.aa.queue.push(args);
  };
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: jest.fn(),
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
  analytics.addAlgoliaAgent = jest.fn(analytics.addAlgoliaAgent);

  analytics.viewedFilters = jest.fn(analytics.viewedFilters);
  analytics.viewedObjectIDs = jest.fn(analytics.viewedObjectIDs);
  analytics.clickedFilters = jest.fn(analytics.clickedFilters);
  analytics.clickedObjectIDs = jest.fn(analytics.clickedObjectIDs);
  analytics.clickedObjectIDsAfterSearch = jest.fn(
    analytics.clickedObjectIDsAfterSearch
  );
  analytics.convertedFilters = jest.fn(analytics.convertedFilters);
  analytics.convertedObjectIDs = jest.fn(analytics.convertedObjectIDs);
  analytics.convertedObjectIDsAfterSearch = jest.fn(
    analytics.convertedObjectIDsAfterSearch
  );
  return analytics;
}
