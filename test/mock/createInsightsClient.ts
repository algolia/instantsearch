import {
  AlgoliaAnalytics,
  getFunctionalInterface,
  getRequesterForBrowser,
  processQueue,
} from 'search-insights/index-browser.cjs';

export function createInsights() {
  const analytics = mockSendingEvents(
    new AlgoliaAnalytics({
      requestFn: getRequesterForBrowser(),
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
  const analytics = mockSendingEvents(
    new AlgoliaAnalytics({
      requestFn: getRequesterForBrowser(),
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

function mockSendingEvents(analytics: AlgoliaAnalytics) {
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
