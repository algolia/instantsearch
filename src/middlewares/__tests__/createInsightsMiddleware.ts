import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { createInsightsMiddleware } from '../';
import { createInstantSearch } from '../../../test/mock/createInstantSearch';
import {
  createAlgoliaAnalytics,
  createInsightsClient,
  createInsightsUmdVersion,
  AlgoliaAnalytics,
  ANONYMOUS_TOKEN,
} from '../../../test/mock/createInsightsClient';
import { warning } from '../../lib/utils';
import { SearchClient } from '../../types';

describe('insights', () => {
  const createTestEnvironment = () => {
    const analytics = createAlgoliaAnalytics();
    const insightsClient = jest.fn(createInsightsClient(analytics));
    const instantSearchInstance = createInstantSearch({
      client: algoliasearch('myAppId', 'myApiKey'),
    });
    const helper = algoliasearchHelper({} as SearchClient, '');
    const getUserToken = () => {
      return (helper.state as any).userToken;
    };
    // @ts-expect-error
    instantSearchInstance.mainIndex = {
      getHelper: () => helper,
    };

    return {
      analytics,
      insightsClient,
      instantSearchInstance,
      helper,
      getUserToken,
    };
  };

  const createUmdTestEnvironment = (algoliaAnalytics?: AlgoliaAnalytics) => {
    const {
      insightsClient,
      libraryLoadedAndProcessQueue,
    } = createInsightsUmdVersion(algoliaAnalytics);
    const instantSearchInstance = createInstantSearch({
      client: algoliasearch('myAppId', 'myApiKey'),
    });
    const helper = algoliasearchHelper({} as SearchClient, '');
    const getUserToken = () => {
      return (helper.state as any).userToken;
    };
    // @ts-expect-error
    instantSearchInstance.mainIndex = {
      getHelper: () => helper,
    };
    return {
      insightsClient,
      libraryLoadedAndProcessQueue,
      instantSearchInstance,
      helper,
      getUserToken,
    };
  };

  beforeEach(() => {
    warning.cache = {};
  });

  describe('usage', () => {
    it('throws when insightsClient is not given', () => {
      expect(() =>
        // @ts-expect-error
        createInsightsMiddleware()
      ).toThrowErrorMatchingInlineSnapshot(
        `"The \`insightsClient\` option is required if you want userToken to be automatically set in search calls. If you don't want this behaviour, set it to \`null\`."`
      );
    });

    it('passes with insightsClient: null', () => {
      expect(() =>
        createInsightsMiddleware({
          insightsClient: null,
        })
      ).not.toThrow();
    });
  });

  describe('initialize', () => {
    it('passes initParams to insightsClient', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();
      createInsightsMiddleware({
        insightsClient,
        insightsInitParams: {
          useCookie: false,
          region: 'de',
        },
      })({ instantSearchInstance });

      expect(insightsClient).toHaveBeenLastCalledWith('init', {
        apiKey: 'myApiKey',
        appId: 'myAppId',
        region: 'de',
        useCookie: false,
      });
    });

    it('does not throw when an event is sent right after the creation in UMD', () => {
      const algoliaAnalytics = createAlgoliaAnalytics();
      const {
        insightsClient,
        libraryLoadedAndProcessQueue,
        instantSearchInstance,
      } = createUmdTestEnvironment(algoliaAnalytics);

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      // It tries to send an event.
      instantSearchInstance.sendEventToInsights({
        eventType: 'view',
        insightsMethod: 'viewedObjectIDs',
        payload: {
          eventName: 'Hits Viewed',
          index: '',
          objectIDs: ['1', '2'],
        },
        widgetType: 'ais.hits',
      });
      expect(algoliaAnalytics.viewedObjectIDs).toHaveBeenCalledTimes(0);

      // But, the library hasn't been loaded yet, so the event stays in the queue.
      expect(insightsClient.queue[insightsClient.queue.length - 1]).toEqual([
        'viewedObjectIDs',
        { eventName: 'Hits Viewed', index: '', objectIDs: ['1', '2'] },
      ]);

      // When the library is loaded later, it consumes the queue and sends the event.
      libraryLoadedAndProcessQueue();
      expect(algoliaAnalytics.viewedObjectIDs).toHaveBeenCalledTimes(1);
      expect(algoliaAnalytics.viewedObjectIDs).toHaveBeenCalledWith({
        eventName: 'Hits Viewed',
        index: '',
        objectIDs: ['1', '2'],
      });
    });

    it('applies clickAnalytics', () => {
      const {
        insightsClient,
        instantSearchInstance,
        helper,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.clickAnalytics).toBe(true);
    });

    it("doesn't reset page", () => {
      const {
        insightsClient,
        instantSearchInstance,
        helper,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      helper.setPage(100);
      middleware.subscribe();
      expect(helper.state.page).toBe(100);
    });
  });

  describe('userToken', () => {
    it('applies userToken which was set before subscribe()', () => {
      const {
        insightsClient,
        instantSearchInstance,
        getUserToken,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      insightsClient('setUserToken', 'abc');
      middleware.subscribe();
      expect(getUserToken()).toEqual('abc');
    });

    it('applies userToken before subscribe() without resetting the page', () => {
      const {
        insightsClient,
        instantSearchInstance,
        getUserToken,
        helper,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      insightsClient('setUserToken', 'abc');
      helper.setPage(100);
      middleware.subscribe();
      expect(helper.state.page).toBe(100);
      expect(getUserToken()).toEqual('abc');
    });

    it('applies userToken which was set after subscribe()', () => {
      const {
        insightsClient,
        instantSearchInstance,
        getUserToken,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      insightsClient('setUserToken', 'def');
      expect(getUserToken()).toEqual('def');
    });

    it('applies userToken which was set after subscribe() without resetting the page', () => {
      const {
        insightsClient,
        instantSearchInstance,
        helper,
        getUserToken,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      helper.setPage(100);
      middleware.subscribe();
      insightsClient('setUserToken', 'def');
      expect(helper.state.page).toEqual(100);
      expect(getUserToken()).toEqual('def');
    });

    it('applies userToken from cookie when nothing given', () => {
      const {
        insightsClient,
        instantSearchInstance,
        getUserToken,
      } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(getUserToken()).toEqual(ANONYMOUS_TOKEN);
    });

    it('applies userToken which was set before init', () => {
      const {
        insightsClient,
        instantSearchInstance,
        getUserToken,
      } = createTestEnvironment();

      insightsClient('setUserToken', 'token-from-queue-before-init');

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(getUserToken()).toEqual('token-from-queue-before-init');
    });

    describe('umd', () => {
      it('applies userToken from queue if exists', () => {
        const {
          insightsClient,
          libraryLoadedAndProcessQueue,
          instantSearchInstance,
          getUserToken,
        } = createUmdTestEnvironment();

        // call init and setUserToken even before the library is loaded.
        insightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
        insightsClient('setUserToken', 'token-from-queue');
        libraryLoadedAndProcessQueue();

        insightsClient('getUserToken', null, (_error, userToken) => {
          expect(userToken).toEqual('token-from-queue');
        });

        const middleware = createInsightsMiddleware({
          insightsClient,
        })({ instantSearchInstance });
        middleware.subscribe();
        expect(getUserToken()).toEqual('token-from-queue');
      });

      it('applies userToken from queue even though the queue is not processed', () => {
        const {
          insightsClient,
          instantSearchInstance,
          getUserToken,
          libraryLoadedAndProcessQueue,
        } = createUmdTestEnvironment();

        // call init and setUserToken even before the library is loaded.
        insightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
        insightsClient('setUserToken', 'token-from-queue');

        insightsClient('getUserToken', null, (_error, userToken) => {
          expect(userToken).toEqual('token-from-queue');
        });

        const middleware = createInsightsMiddleware({
          insightsClient,
        })({ instantSearchInstance });
        middleware.subscribe();
        libraryLoadedAndProcessQueue();
        expect(getUserToken()).toEqual('token-from-queue');
      });

      it('ignores userToken set before init', () => {
        const {
          insightsClient,
          instantSearchInstance,
          libraryLoadedAndProcessQueue,
          getUserToken,
        } = createUmdTestEnvironment();

        insightsClient('setUserToken', 'token-from-queue-before-init');
        insightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
        libraryLoadedAndProcessQueue();

        const middleware = createInsightsMiddleware({
          insightsClient,
        })({ instantSearchInstance });
        middleware.subscribe();
        expect(getUserToken()).toEqual(ANONYMOUS_TOKEN);
      });
    });
  });

  describe('sendEventToInsights', () => {
    it('sends events', () => {
      const {
        insightsClient,
        instantSearchInstance,
        analytics,
      } = createTestEnvironment();

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'viewedObjectIDs',
        widgetType: 'ais.customWidget',
        eventType: 'click',
        payload: {
          hello: 'world',
        },
      });
      expect(analytics.viewedObjectIDs).toHaveBeenCalledTimes(1);
      expect(analytics.viewedObjectIDs).toHaveBeenCalledWith({
        hello: 'world',
      });
    });

    it('calls onEvent when given', () => {
      const {
        insightsClient,
        instantSearchInstance,
        analytics,
      } = createTestEnvironment();

      const onEvent = jest.fn();
      const middleware = createInsightsMiddleware({
        insightsClient,
        onEvent,
      })({ instantSearchInstance });
      middleware.subscribe();

      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'viewedObjectIDs',
        widgetType: 'ais.customWidget',
        eventType: 'click',
        payload: {
          hello: 'world',
        },
      });
      expect(analytics.viewedObjectIDs).toHaveBeenCalledTimes(0);
      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith(
        {
          insightsMethod: 'viewedObjectIDs',
          widgetType: 'ais.customWidget',
          eventType: 'click',
          payload: {
            hello: 'world',
          },
        },
        insightsClient
      );
    });

    it('warns dev when neither insightsMethod nor onEvent is given', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      const numberOfCalls = insightsClient.mock.calls.length;
      expect(() => {
        instantSearchInstance.sendEventToInsights({
          widgetType: 'ais.customWidget',
          eventType: 'click',
          payload: {
            hello: 'world',
          },
        });
      }).toWarnDev();
      expect(insightsClient).toHaveBeenCalledTimes(numberOfCalls); // still the same
    });
  });
});
