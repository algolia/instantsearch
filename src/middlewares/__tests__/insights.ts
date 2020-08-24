import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { createInsightsMiddleware } from '../insights';
import { createInstantSearch } from '../../../test/mock/createInstantSearch';
import {
  createAlgoliaAnalytics,
  createInsightsClient,
  createInsightsUmdVersion,
  ANONYMOUS_TOKEN,
} from '../../../test/mock/createInsightsClient';
import { warning } from '../../../src/lib/utils';
import { SearchClient } from '../../types';

describe('insights', () => {
  let analytics;
  let insightsClient;
  let instantSearchInstance;
  let helper;

  beforeEach(() => {
    analytics = createAlgoliaAnalytics();
    insightsClient = jest.fn(createInsightsClient(analytics));
    instantSearchInstance = createInstantSearch({
      client: algoliasearch('myAppId', 'myApiKey'),
    });
    helper = algoliasearchHelper({} as SearchClient, '');
    instantSearchInstance.mainIndex = {
      getHelper: () => helper,
    };
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

    it('warns dev if userToken is set before creating the middleware', () => {
      insightsClient('setUserToken', 'abc');
      expect(() => {
        createInsightsMiddleware({
          insightsClient,
        })({ instantSearchInstance });
      })
        .toWarnDev(`[InstantSearch.js]: You set userToken before \`createInsightsMiddleware()\` and it is ignored.
Please set the token after the \`createInsightsMiddleware()\` call.

createInsightsMiddleware({ /* ... */ });

insightsClient('setUserToken', 'your-user-token');
// or
aa('setUserToken', 'your-user-token');`);
    });

    it('applies clickAnalytics', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.clickAnalytics).toBe(true);
    });
  });

  describe('userToken', () => {
    it('applies userToken which was set before subscribe()', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      insightsClient('setUserToken', 'abc');
      middleware.subscribe();
      expect(helper.state.userToken).toEqual('abc');
    });

    it('applies userToken which was set after subscribe()', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      insightsClient('setUserToken', 'def');
      expect(helper.state.userToken).toEqual('def');
    });

    it('applies userToken from cookie when nothing given', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.userToken).toEqual(ANONYMOUS_TOKEN);
    });

    it('applies userToken from queue if exists', () => {
      const {
        insightsClient: localInsightsClient,
        libraryLoadedAndProcessQueue,
      } = createInsightsUmdVersion();

      // call init and setUserToken even before the library is loaded.
      localInsightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
      localInsightsClient('setUserToken', 'token-from-queue');
      libraryLoadedAndProcessQueue();

      localInsightsClient('_get', '_userToken', userToken => {
        expect(userToken).toEqual('token-from-queue');
      });

      const middleware = createInsightsMiddleware({
        insightsClient: localInsightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.userToken).toEqual('token-from-queue');
    });

    it('applies userToken from queue even though the queue is not processed', () => {
      const {
        insightsClient: localInsightsClient,
      } = createInsightsUmdVersion();

      // call init and setUserToken even before the library is loaded.
      localInsightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
      localInsightsClient('setUserToken', 'token-from-queue');

      localInsightsClient('_get', '_userToken', userToken => {
        expect(userToken).toEqual('token-from-queue');
      });

      const middleware = createInsightsMiddleware({
        insightsClient: localInsightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.userToken).toEqual('token-from-queue');
    });

    it('ignores userToken set before init (umd)', () => {
      const {
        insightsClient: localInsightsClient,
        libraryLoadedAndProcessQueue,
      } = createInsightsUmdVersion();

      localInsightsClient('setUserToken', 'token-from-queue-before-init');
      localInsightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
      libraryLoadedAndProcessQueue();

      const middleware = createInsightsMiddleware({
        insightsClient: localInsightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.userToken).toEqual(ANONYMOUS_TOKEN);
    });

    it('ignores userToken set before init (cjs)', () => {
      insightsClient('setUserToken', 'token-from-queue-before-init');

      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();
      expect(helper.state.userToken).toEqual(ANONYMOUS_TOKEN);
    });
  });

  describe('sendEventToInsights', () => {
    it('sends events', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'viewedObjectIDs',
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
      const onEvent = jest.fn();
      const middleware = createInsightsMiddleware({
        insightsClient,
        onEvent,
      })({ instantSearchInstance });
      middleware.subscribe();

      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'viewedObjectIDs',
        payload: {
          hello: 'world',
        },
      });
      expect(analytics.viewedObjectIDs).toHaveBeenCalledTimes(0);
      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onEvent).toHaveBeenCalledWith({
        insightsMethod: 'viewedObjectIDs',
        payload: {
          hello: 'world',
        },
      });
    });

    it('warns dev when neither insightsMethod nor onEvent is given', () => {
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      middleware.subscribe();

      const numberOfCalls = insightsClient.mock.calls.length;
      expect(() => {
        instantSearchInstance.sendEventToInsights({
          payload: {
            hello: 'world',
          },
        });
      }).toWarnDev();
      expect(insightsClient).toHaveBeenCalledTimes(numberOfCalls); // still the same
    });
  });
});
