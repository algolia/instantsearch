import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { createInsightsMiddleware } from '../createInsightsMiddleware';
import { createInstantSearch } from '../../../test/mock/createInstantSearch';
import {
  createAlgoliaAnalytics,
  createInsightsClient,
  createInsightsUmdVersion,
  ANONYMOUS_TOKEN,
} from '../../../test/mock/createInsightsClient';
import { warning } from '../../lib/utils';
import { SearchClient } from '../../types';
import { Index } from '../../widgets/index/index';

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
    instantSearchInstance.mainIndex = {
      getHelper: () => helper,
    } as Index;

    return {
      analytics,
      insightsClient,
      instantSearchInstance,
      helper,
      getUserToken,
    };
  };

  const createUmdTestEnvironment = () => {
    const {
      insightsClient,
      libraryLoadedAndProcessQueue,
    } = createInsightsUmdVersion();
    const instantSearchInstance = createInstantSearch({
      client: algoliasearch('myAppId', 'myApiKey'),
    });
    const helper = algoliasearchHelper({} as SearchClient, '');
    const getUserToken = () => {
      return (helper.state as any).userToken;
    };
    instantSearchInstance.mainIndex = {
      getHelper: () => helper,
    } as Index;
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
        // @ts-ignore:next-line
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
    it('initialize insightsClient', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();
      expect.assertions(3);

      insightsClient('setUserToken', 'abc');
      createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      insightsClient('_get', '_hasCredentials', hasCredentials => {
        expect(hasCredentials).toBe(true);
      });
      insightsClient('_get', '_appId', appId => {
        expect(appId).toBe('myAppId');
      });
      insightsClient('_get', '_apiKey', apiKey => {
        expect(apiKey).toBe('myApiKey');
      });
    });

    it('does not throw when an event is sent right after the creation in UMD', done => {
      const {
        insightsClient,
        libraryLoadedAndProcessQueue,
        instantSearchInstance,
      } = createUmdTestEnvironment();

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      setTimeout(() => {
        // When the library is loaded later, it consumes the queue and sends the event.
        const { algoliaAnalytics } = libraryLoadedAndProcessQueue();
        expect(algoliaAnalytics.viewedObjectIDs).toHaveBeenCalledTimes(1);
        expect(algoliaAnalytics.viewedObjectIDs).toHaveBeenCalledWith({
          eventName: 'Hits Viewed',
          index: '',
          objectIDs: ['1', '2'],
        });
        done();
      }, 200);

      expect(() => {
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
      }).not.toThrow();

      // The library is not loaded yet, so it stays in the queue.
      expect(insightsClient.queue[insightsClient.queue.length - 1]).toEqual([
        'viewedObjectIDs',
        { eventName: 'Hits Viewed', index: '', objectIDs: ['1', '2'] },
      ]);
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

        insightsClient('_get', '_userToken', userToken => {
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

        insightsClient('_get', '_userToken', userToken => {
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
