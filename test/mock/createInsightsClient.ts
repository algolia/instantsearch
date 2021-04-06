import { AlgoliaAnalytics } from 'search-insights/index-browser.cjs';

export function createInsights() {
  const analytics = mockSendingEvents(
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
  const analytics = mockSendingEvents(
    new AlgoliaAnalytics({
      requestFn: jest.fn(),
    })
  );

  return {
    analytics,
    insightsClient: globalObject.aa,
    libraryLoadedAndProcessQueue: () => {
      processQueue(analytics, globalObject);
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

function getFunctionalInterface(instance: AlgoliaAnalytics) {
  return (functionName: string, ...functionArguments: any[]) => {
    instance[functionName](...functionArguments);
  };
}

function processQueue(instance: AlgoliaAnalytics, globalObject: any) {
  // Set pointer which allows renaming of the script
  const pointer = globalObject.AlgoliaAnalyticsObject as string;

  if (pointer) {
    const _aa = getFunctionalInterface(instance);

    // `aa` is the user facing function, which is defined in the install snippet.
    //  - before library is initialized  `aa` fills a queue
    //  - after library is initialized  `aa` calls `_aa`
    const aa = globalObject[pointer];
    aa.queue = aa.queue || [];

    const queue: IArguments[] = aa.queue;

    // Loop queue and execute functions in the queue
    queue.forEach((args: IArguments) => {
      const [functionName, ...functionArguments] = [].slice.call(args);
      _aa(functionName, ...functionArguments);
    });

    // @ts-expect-error array.push function is expected to return
    //                  the length of the array after push but we don't need it here
    queue.push = (args: IArguments) => {
      const [functionName, ...functionArguments] = [].slice.call(args);
      _aa(functionName, ...functionArguments);
    };
  }
}
