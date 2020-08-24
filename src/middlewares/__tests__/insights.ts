import algoliasearch from 'algoliasearch';
import algoliasearchHelper from 'algoliasearch-helper';
import { createInsightsMiddleware } from '../insights';
import { createInstantSearch } from '../../../test/mock/createInstantSearch';
import {
  createInsightsClient,
  createInsightsUmdVersion,
  ANONYMOUS_TOKEN,
} from '../../../test/mock/createInsightsClient';
import { warning } from '../../../src/lib/utils';

describe('insights', () => {
  let insightsClient;
  let instantSearchInstance;
  let helper;

  beforeEach(() => {
    insightsClient = createInsightsClient();
    instantSearchInstance = createInstantSearch({
      client: algoliasearch('myAppId', 'myApiKey'),
    });
    helper = algoliasearchHelper({}, '');
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
        `"The \`insightsClient\` option is required if you want userToken to be automatically set in search calls. If you don't want this behaviour, set it to \`false\`."`
      );
    });

    it('passes with insightsClient: false', () => {
      expect(() =>
        createInsightsMiddleware({
          insightsClient: false,
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

  // describe('sendEvent', () => {});
});
