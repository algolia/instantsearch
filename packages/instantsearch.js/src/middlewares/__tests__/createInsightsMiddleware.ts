/**
 * @jest-environment jsdom-global
 */

import {
  createInsights,
  createInsightsUmdVersion,
  createSearchClient,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { fireEvent } from '@testing-library/dom';

import { createInsightsMiddleware } from '..';
import { createInstantSearch } from '../../../test/createInstantSearch';
import instantsearch from '../../index.es';
import { history } from '../../lib/routers';
import { warning } from '../../lib/utils';

import type { PlainSearchParameters } from 'algoliasearch-helper';
import type { JSDOM } from 'jsdom';

declare const jsdom: JSDOM;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      document?: Document;
    }
  }
}

describe('insights', () => {
  const searchClientWithCredentials = createSearchClient({
    // @ts-expect-error only available in search client v4
    transporter: {
      headers: {
        'x-algolia-application-id': 'myAppId',
        'x-algolia-api-key': 'myApiKey',
      },
    },
  });
  const createTestEnvironment = ({
    searchClient = searchClientWithCredentials,
    started = true,
    insights = false,
  } = {}) => {
    const { analytics, insightsClient } = createInsights();
    const indexName = 'my-index';
    const instantSearchInstance = instantsearch({
      searchClient,
      indexName,
      insights,
    });
    if (started) {
      instantSearchInstance.start();
    }

    const getUserToken = () =>
      (instantSearchInstance.helper!.state as PlainSearchParameters).userToken;

    return {
      analytics,
      insightsClient,
      instantSearchInstance,
      getUserToken,
    };
  };

  const createUmdTestEnvironment = () => {
    const { analytics, insightsClient, libraryLoadedAndProcessQueue } =
      createInsightsUmdVersion();

    const indexName = 'my-index';
    const instantSearchInstance = instantsearch({
      searchClient: createSearchClient({
        // @ts-expect-error only available in search client v4
        transporter: {
          headers: {
            'x-algolia-application-id': 'my-app-id',
            'x-algolia-api-key': 'my-api-key',
          },
        },
      }),
      insights: false,
      indexName,
    });
    instantSearchInstance.start();

    const helper = instantSearchInstance.helper!;

    const getUserToken = () =>
      (instantSearchInstance.helper!.state as PlainSearchParameters).userToken;

    return {
      analytics,
      insightsClient,
      libraryLoadedAndProcessQueue,
      instantSearchInstance,
      helper,
      getUserToken,
    };
  };

  beforeEach(() => {
    warning.cache = {};

    (window as any).AlgoliaAnalyticsObject = undefined;
    (window as any).aa = undefined;

    document.body.innerHTML = '';
  });

  describe('usage', () => {
    it('passes when insightsClient is not given', () => {
      expect(() => createInsightsMiddleware()).not.toThrow();
    });

    it('passes with insightsClient: null', () => {
      expect(() =>
        createInsightsMiddleware({
          insightsClient: null,
        })
      ).not.toThrow();
    });
  });

  describe('insightsClient', () => {
    it('does nothing when insightsClient is passed', () => {
      const { instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({ insightsClient: () => {} })
      );

      expect(document.body).toMatchInlineSnapshot(`<body />`);
      expect((window as any).AlgoliaAnalyticsObject).toBe(undefined);
      expect((window as any).aa).toBe(undefined);
    });

    it('does nothing when insightsClient is null', () => {
      const { instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({ insightsClient: null })
      );

      expect(document.body).toMatchInlineSnapshot(`<body />`);
      expect((window as any).AlgoliaAnalyticsObject).toBe(undefined);
      expect((window as any).aa).toBe(undefined);
    });

    it('does nothing when insightsClient is already present', () => {
      (window as any).AlgoliaAnalyticsObject = 'aa';
      const aa = () => {};
      (window as any).aa = aa;

      const { instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(createInsightsMiddleware());

      expect(document.body).toMatchInlineSnapshot(`<body />`);
      expect((window as any).AlgoliaAnalyticsObject).toBe('aa');
      expect((window as any).aa).toBe(aa);
    });

    it('loads the script when insightsClient is not passed', () => {
      const { instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(createInsightsMiddleware());

      expect(document.body).toMatchInlineSnapshot(`
        <body>
          <script
            src="https://cdn.jsdelivr.net/npm/search-insights@2.3.0/dist/search-insights.min.js"
          />
        </body>
      `);
      expect((window as any).AlgoliaAnalyticsObject).toBe('aa');
      expect((window as any).aa).toEqual(expect.any(Function));
    });

    it('notifies when the script fails to be added', () => {
      const { instantSearchInstance } = createTestEnvironment();
      const createElement = document.createElement;
      document.createElement = () => {
        throw new Error('error');
      };

      instantSearchInstance.on('error', (error) =>
        expect(error).toMatchInlineSnapshot(
          `[Error: [insights middleware]: could not load search-insights.js. Please load it manually following https://alg.li/insights-init]`
        )
      );

      instantSearchInstance.use(createInsightsMiddleware());

      document.createElement = createElement;
    });

    it('notifies when the script fails to load', () => {
      const { instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.on('error', (error) =>
        expect(error).toMatchInlineSnapshot(
          `[Error: [insights middleware]: could not load search-insights.js. Please load it manually following https://alg.li/insights-init]`
        )
      );

      instantSearchInstance.use(createInsightsMiddleware());

      fireEvent(document.querySelector('script')!, new ErrorEvent('error'));
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

    it('throws when search client does not have credentials', () => {
      const { insightsClient } = createInsights();
      const instantSearchInstance = createInstantSearch({
        // @ts-expect-error fake client
        client: { search: () => {} },
      });
      expect(() =>
        createInsightsMiddleware({
          insightsClient,
        })({ instantSearchInstance })
      ).toThrowErrorMatchingInlineSnapshot(
        `"apiKey is missing, please provide it so we can authenticate the application"`
      );
    });

    it('warns when search client does not have credentials', () => {
      const { insightsClient } = createInsights();
      const instantSearchInstance = createInstantSearch({
        // @ts-expect-error fake client
        client: { search: () => {} },
      });
      expect(() => {
        try {
          createInsightsMiddleware({
            insightsClient,
          })({ instantSearchInstance });
        } catch (e) {
          // insights error
        }
      }).toWarnDev(
        '[InstantSearch.js]: could not extract Algolia credentials from searchClient in insights middleware.'
      );
    });

    it('does not throw without userToken in UMD with the library loaded after the event', () => {
      const {
        insightsClient,
        libraryLoadedAndProcessQueue,
        instantSearchInstance,
      } = createUmdTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          insightsInitParams: { useCookie: false },
        })
      );

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

      // When the library is loaded later, it consumes the queue and sends the event.
      expect(() => {
        libraryLoadedAndProcessQueue();
      }).not.toThrow(
        "Before calling any methods on the analytics, you first need to call 'setUserToken' function or include 'userToken' in the event payload."
      );
    });

    it('does not throw without userToken in UMD with the library loaded before the event', () => {
      const {
        insightsClient,
        libraryLoadedAndProcessQueue,
        instantSearchInstance,
      } = createUmdTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          insightsInitParams: { useCookie: false },
        })
      );

      libraryLoadedAndProcessQueue();

      expect(() => {
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
      }).not.toThrow(
        "Before calling any methods on the analytics, you first need to call 'setUserToken' function or include 'userToken' in the event payload."
      );
    });

    it('does not throw without userToken in CJS', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          insightsInitParams: { useCookie: false },
        })
      );

      expect(() => {
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
      }).not.toThrow(
        "Before calling any methods on the analytics, you first need to call 'setUserToken' function or include 'userToken' in the event payload."
      );
    });

    it('warns when userToken is not set', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          insightsInitParams: { useCookie: false },
        })
      );

      expect(() =>
        instantSearchInstance.sendEventToInsights({
          eventType: 'view',
          insightsMethod: 'viewedObjectIDs',
          payload: {
            eventName: 'Hits Viewed',
            index: '',
            objectIDs: ['1', '2'],
          },
          widgetType: 'ais.hits',
        })
      ).toWarnDev(
        `[InstantSearch.js]: Cannot send event to Algolia Insights because \`userToken\` is not set.

See documentation: https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/js/#setting-the-usertoken`
      );
    });

    it('applies clickAnalytics', () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();
      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );
      expect(instantSearchInstance.helper!.state.clickAnalytics).toBe(true);
    });

    it("doesn't reset page", () => {
      const { insightsClient, instantSearchInstance } = createTestEnvironment();
      const middleware = createInsightsMiddleware({
        insightsClient,
      })({ instantSearchInstance });
      instantSearchInstance.helper!.setPage(100);
      middleware.subscribe();
      expect(instantSearchInstance.helper!.state.page).toBe(100);
    });

    it('adds user agent', () => {
      const { analytics, insightsClient, instantSearchInstance } =
        createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );

      expect(analytics.addAlgoliaAgent).toHaveBeenCalledTimes(1);
      expect(analytics.addAlgoliaAgent).toHaveBeenCalledWith(
        'insights-middleware'
      );
    });

    it('removes default middleware if user adds a custom one', () => {
      const { instantSearchInstance } = createTestEnvironment({
        insights: true,
      });

      // just the internal one
      expect(instantSearchInstance.middleware).toHaveLength(1);
      expect(instantSearchInstance.middleware).toMatchInlineSnapshot(`
        [
          {
            "creator": [Function],
            "instance": {
              "$$internal": true,
              "$$type": "ais.insights",
              "onStateChange": [Function],
              "started": [Function],
              "subscribe": [Function],
              "unsubscribe": [Function],
            },
          },
        ]
      `);

      instantSearchInstance.use(
        createInsightsMiddleware({ insightsClient: () => {} })
      );

      // just the user-provided one
      expect(instantSearchInstance.middleware).toHaveLength(1);
      expect(instantSearchInstance.middleware).toMatchInlineSnapshot(`
        [
          {
            "creator": [Function],
            "instance": {
              "$$internal": false,
              "$$type": "ais.insights",
              "onStateChange": [Function],
              "started": [Function],
              "subscribe": [Function],
              "unsubscribe": [Function],
            },
          },
        ]
      `);

      instantSearchInstance.use(createInsightsMiddleware({}));

      // both user-provided
      expect(instantSearchInstance.middleware).toHaveLength(2);
      expect(instantSearchInstance.middleware).toMatchInlineSnapshot(`
        [
          {
            "creator": [Function],
            "instance": {
              "$$internal": false,
              "$$type": "ais.insights",
              "onStateChange": [Function],
              "started": [Function],
              "subscribe": [Function],
              "unsubscribe": [Function],
            },
          },
          {
            "creator": [Function],
            "instance": {
              "$$internal": false,
              "$$type": "ais.insights",
              "onStateChange": [Function],
              "started": [Function],
              "subscribe": [Function],
              "unsubscribe": [Function],
            },
          },
        ]
      `);
    });
  });

  describe('userToken', () => {
    it('applies userToken which was set before subscribe()', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment();

      insightsClient('setUserToken', 'abc');

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );

      expect(getUserToken()).toEqual('abc');
    });

    it('applies userToken before subscribe() without resetting the page', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment({ started: false });

      insightsClient('setUserToken', 'abc');
      instantSearchInstance.start();
      instantSearchInstance.helper!.setPage(100);

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );

      expect(instantSearchInstance.helper!.state.page).toBe(100);
      expect(getUserToken()).toEqual('abc');
    });

    it('applies userToken which was set after subscribe()', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment();
      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );
      insightsClient('setUserToken', 'def');
      expect(getUserToken()).toEqual('def');
    });

    it('applies userToken which was set after subscribe() without resetting the page', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment({ started: false });

      instantSearchInstance.start();
      instantSearchInstance.helper!.setPage(100);

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );

      insightsClient('setUserToken', 'def');
      expect(instantSearchInstance.helper!.state.page).toEqual(100);
      expect(getUserToken()).toEqual('def');
    });

    it('applies userToken from cookie when nothing given', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment();
      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          insightsInitParams: { useCookie: true },
        })
      );
      expect(getUserToken()).toEqual(expect.stringMatching(/^anonymous-/));
    });

    it('applies userToken which was set before init', () => {
      const { insightsClient, instantSearchInstance, getUserToken } =
        createTestEnvironment();

      insightsClient('setUserToken', 'token-from-queue-before-init');

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );
      expect(getUserToken()).toEqual('token-from-queue-before-init');
    });

    it('handles multiple setUserToken calls before search.start()', () => {
      const { insightsClient } = createInsights();
      const indexName = 'my-index';
      const instantSearchInstance = instantsearch({
        searchClient: createSearchClient({
          // @ts-expect-error only available in search client v4
          transporter: {
            headers: {
              'x-algolia-application-id': 'myAppId',
              'x-algolia-api-key': 'myApiKey',
            },
          },
        }),
        indexName,
      });

      const middleware = createInsightsMiddleware({
        insightsClient,
      });
      instantSearchInstance.use(middleware);

      insightsClient('setUserToken', 'abc');
      insightsClient('setUserToken', 'def');

      instantSearchInstance.start();

      expect(
        (instantSearchInstance.helper!.state as PlainSearchParameters).userToken
      ).toEqual('def');
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

        instantSearchInstance.use(
          createInsightsMiddleware({
            insightsClient,
          })
        );
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

        instantSearchInstance.use(
          createInsightsMiddleware({
            insightsClient,
          })
        );
        libraryLoadedAndProcessQueue();
        expect(getUserToken()).toEqual('token-from-queue');
      });

      it('does not override userToken set before init with anonymous token', () => {
        const {
          insightsClient,
          instantSearchInstance,
          libraryLoadedAndProcessQueue,
          getUserToken,
        } = createUmdTestEnvironment();

        insightsClient('setUserToken', 'token-from-queue-before-init');
        insightsClient('init', { appId: 'myAppId', apiKey: 'myApiKey' });
        libraryLoadedAndProcessQueue();

        instantSearchInstance.use(
          createInsightsMiddleware({
            insightsClient,
          })
        );
        expect(getUserToken()).toEqual('token-from-queue-before-init');
      });
    });
  });

  describe('sendEventToInsights', () => {
    it('sends events', () => {
      const { insightsClient, instantSearchInstance, analytics } =
        createTestEnvironment();

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );
      insightsClient('setUserToken', 'token');

      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'viewedObjectIDs',
        widgetType: 'ais.customWidget',
        eventType: 'view',
        payload: {
          index: 'my-index',
          eventName: 'My Hits Viewed',
          objectIDs: ['obj1'],
        },
      });

      expect(analytics.viewedObjectIDs).toHaveBeenCalledTimes(1);
      expect(analytics.viewedObjectIDs).toHaveBeenCalledWith({
        index: 'my-index',
        eventName: 'My Hits Viewed',
        objectIDs: ['obj1'],
      });
    });

    it('calls onEvent when given', () => {
      const { insightsClient, instantSearchInstance, analytics } =
        createTestEnvironment();

      const onEvent = jest.fn();
      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
          onEvent,
        })
      );

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

      instantSearchInstance.use(
        createInsightsMiddleware({
          insightsClient,
        })
      );

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

  test("does not write to the URL on load when there's an existing anonymous cookie", async () => {
    // this test exists to ensure that any changes to the user token or
    const url = 'https://example.com/?instant_search%5Bquery%5D=test';
    jsdom.reconfigure({ url });
    document.cookie = '_ALGOLIA=blabla';

    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: searchClientWithCredentials,
      routing: {
        router: history({
          writeDelay: 10,
        }),
      },
    });

    search.start();

    // insights is added *after start*, like in React InstantSearch Hooks
    search.use(
      createInsightsMiddleware({
        insightsClient(eventName, ...args) {
          if (eventName === 'onUserTokenChange') {
            const [cb] = args;
            cb('token');
          }
        },
      })
    );

    await wait(100);
    // url should not get cleared
    expect(document.location.href).toEqual(url);

    document.cookie = '';
  });

  test('does not throw error when document or cookie are undefined', () => {
    const originalDocument = global.document;
    // @ts-expect-error
    delete global.document;

    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: searchClientWithCredentials,
      routing: {
        router: history({
          writeDelay: 10,
        }),
      },
    });

    // insights is added *after start*, like in React InstantSearch Hooks
    search.use(
      createInsightsMiddleware({
        insightsClient(eventName, ...args) {
          if (eventName === 'onUserTokenChange') {
            const [cb] = args;
            cb('token');
          }
        },
      })
    );

    expect(() => search.start()).not.toThrow();

    global.document = originalDocument;
  });
});
