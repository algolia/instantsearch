/** @jsx h */

import preact, { h, render, createRef } from 'preact';
import originalHelper from 'algoliasearch-helper';
import InstantSearch from '../InstantSearch';
import version from '../version';
import { connectSearchBox, connectPagination } from '../../connectors';
import { index } from '../../widgets';
import { noop, warning } from '../utils';
import {
  createSearchClient,
  createControlledSearchClient,
} from '../../../test/mock/createSearchClient';
import {
  createRenderOptions,
  createWidget,
} from '../../../test/mock/createWidget';
import { runAllMicroTasks } from '../../../test/utils/runAllMicroTasks';
import { castToJestMock } from '../../../test/utils/castToJestMock';
import { IndexWidget } from '../../widgets/index/index';
import { Widget } from '../../types';
import {
  PaginationConnectorParams,
  PaginationWidgetDescription,
} from '../../connectors/pagination/connectPagination';
import {
  SearchBoxWidgetDescription,
  SearchBoxConnectorParams,
} from '../../connectors/search-box/connectSearchBox';

type SearchBoxWidgetInstance = Widget<
  SearchBoxWidgetDescription & { widgetParams: SearchBoxConnectorParams }
>;

type PaginationWidgetInstance = Widget<
  PaginationWidgetDescription & { widgetParams: PaginationConnectorParams }
>;

jest.useFakeTimers();

const algoliasearchHelper = castToJestMock(originalHelper);
jest.mock('algoliasearch-helper', () => {
  const module = jest.requireActual('algoliasearch-helper');
  const mock = jest.fn((...args) => {
    const helper = module(...args);

    const searchOnlyWithDerivedHelpers = helper.searchOnlyWithDerivedHelpers.bind(
      helper
    );

    helper.searchOnlyWithDerivedHelpers = jest.fn((...searchArgs) => {
      return searchOnlyWithDerivedHelpers(...searchArgs);
    });

    return helper;
  });

  Object.entries(module).forEach(([key, value]) => {
    mock[key] = value;
  });

  return mock;
});

beforeEach(() => {
  algoliasearchHelper.mockClear();
});

describe('Usage', () => {
  beforeEach(() => {
    warning.cache = {};
  });

  it('throws without indexName', () => {
    expect(() => {
      // @ts-expect-error
      // eslint-disable-next-line no-new
      new InstantSearch({ indexName: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`indexName\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws without searchClient', () => {
    expect(() => {
      // @ts-expect-error
      // eslint-disable-next-line no-new
      new InstantSearch({ indexName: 'indexName', searchClient: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchClient\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if searchClient does not implement a search method', () => {
    expect(() => {
      // @ts-expect-error
      // eslint-disable-next-line no-new
      new InstantSearch({ indexName: 'indexName', searchClient: {} });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchClient\` must implement a \`search\` method.

See: https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/in-depth/backend-instantsearch/js/"
`);
  });

  it('throws if insightsClient is not a function', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    expect(() => {
      // eslint-disable-next-line no-new
      new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
        // @ts-expect-error
        insightsClient: 'insights',
      });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`insightsClient\` option should be a function.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if addWidgets is called with a single widget', () => {
    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      // @ts-expect-error
      search.addWidgets({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`addWidgets\` method expects an array of widgets. Please use \`addWidget\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if a widget without render or init method is added', () => {
    const widgets = [{ $$type: '', render: undefined, init: undefined }];

    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      search.addWidgets(widgets);
    }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`render\` and/or an \`init\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('does not throw with a widget having a init method', () => {
    const widgets = [{ $$type: '', init: () => {} }];

    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      search.addWidgets(widgets);
    }).not.toThrow();
  });

  it('does not throw with a widget having a render method', () => {
    const widgets = [{ $$type: '', render: () => {} }];

    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      search.addWidgets(widgets);
    }).not.toThrow();
  });

  it('throws if removeWidgets is called with a single widget', () => {
    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      // @ts-expect-error
      search.removeWidgets({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`removeWidgets\` method expects an array of widgets. Please use \`removeWidget\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if a widget without dispose method is removed', () => {
    const widgets = [
      { $$type: '', init: () => {}, render: () => {}, dispose: undefined },
    ];

    expect(() => {
      const search = new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
      });
      search.removeWidgets(widgets);
    }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`dispose\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if createURL is called before start', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    expect(() => search.createURL()).toThrowErrorMatchingInlineSnapshot(`
"The \`start\` method needs to be called before \`createURL\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('throws if refresh is called before start', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    expect(() => search.refresh()).toThrowErrorMatchingInlineSnapshot(`
"The \`start\` method needs to be called before \`refresh\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  it('warns dev with EXPERIMENTAL_use', () => {
    const searchClient = createSearchClient({
      addAlgoliaAgent: jest.fn(),
    });

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const middleware = () => ({
      onStateChange: () => {},
      subscribe: () => {},
      unsubscribe: () => {},
    });

    expect(() => {
      search.EXPERIMENTAL_use(middleware);
    }).toWarnDev(
      '[InstantSearch.js]: The middleware API is now considered stable, so we recommend replacing `EXPERIMENTAL_use` with `use` before upgrading to the next major version.'
    );
  });

  it('does not warn dev with use', () => {
    const searchClient = createSearchClient({
      addAlgoliaAgent: jest.fn(),
    });

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const middleware = () => ({
      onStateChange: () => {},
      subscribe: () => {},
      unsubscribe: () => {},
    });

    expect(() => {
      search.use(middleware);
    }).not.toWarnDev();
  });

  it('warns dev when insightsClient is given', () => {
    const searchClient = createSearchClient({
      addAlgoliaAgent: jest.fn(),
    });
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    expect(() => {
      // eslint-disable-next-line no-new
      new InstantSearch({
        indexName: 'indexName',
        searchClient,
        insightsClient: () => {},
      });
    }).toWarnDev(
      `[InstantSearch.js]: \`insightsClient\` property has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );
  });

  it('accepts middleware with partial methods', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const subscribe = jest.fn();
    search.use(() => ({
      subscribe,
    }));
    search.start();
    expect(subscribe).toHaveBeenCalledTimes(1);
  });
});

describe('InstantSearch', () => {
  it('calls addAlgoliaAgent', () => {
    const searchClient = createSearchClient({
      addAlgoliaAgent: jest.fn(),
    });

    // eslint-disable-next-line no-new
    new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `instantsearch.js (${version})`
    );
  });

  it('does not call algoliasearchHelper', () => {
    // eslint-disable-next-line no-new
    new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    expect(algoliasearchHelper).not.toHaveBeenCalled();
  });

  it('warns deprecated usage of `searchParameters`', () => {
    warning.cache = {};
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    expect(() => {
      // eslint-disable-next-line no-new
      new InstantSearch({
        indexName: 'indexName',
        searchClient: createSearchClient(),
        // @ts-expect-error
        searchParameters: {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Samsung'],
          },
        },
      });
    })
      .toWarnDev(`[InstantSearch.js]: The \`searchParameters\` option is deprecated and will not be supported in InstantSearch.js 4.x.

You can replace it with the \`configure\` widget:

\`\`\`
search.addWidgets([
  configure({
  "disjunctiveFacets": [
    "brand"
  ],
  "disjunctiveFacetsRefinements": {
    "brand": [
      "Samsung"
    ]
  }
})
]);
\`\`\`

See https://www.algolia.com/doc/api-reference/widgets/configure/js/`);
  });

  it('does store insightsClient on the instance', () => {
    const insightsClient = () => {};
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      insightsClient,
    });

    expect(search.insightsClient).toBe(insightsClient);
  });

  it("exposes helper's last results", async () => {
    const searchClient = createSearchClient();

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(search.helper).toBe(null);

    search.start();

    await runAllMicroTasks();

    // could be null if we don't pretend the main helper is the one who searched
    expect(search.helper!.lastResults).not.toBe(null);
  });

  describe('metadata middleware', () => {
    const defaultUserAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15';
    const algoliaUserAgent = 'Algolia Crawler 5.3.2';

    let userAgentMock: string;

    beforeAll(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        get() {
          return userAgentMock;
        },
      });
    });

    beforeEach(() => {
      userAgentMock = defaultUserAgent;
    });

    afterEach(() => {
      userAgentMock = defaultUserAgent;
    });

    it("doesn't add metadata middleware by default", () => {
      const useSpy = jest.spyOn(InstantSearch.prototype, 'use');

      // eslint-disable-next-line no-new
      new InstantSearch({
        searchClient: createSearchClient(),
        indexName: 'test',
      });

      expect(useSpy).toHaveBeenCalledTimes(0);
    });

    it('adds metadata middleware on the Crawler user agent', () => {
      userAgentMock = algoliaUserAgent;

      const useSpy = jest.spyOn(InstantSearch.prototype, 'use');

      // eslint-disable-next-line no-new
      new InstantSearch({
        searchClient: createSearchClient(),
        indexName: 'test',
      });

      expect(useSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('addWidget(s)', () => {
  beforeEach(() => {
    warning.cache = {};
  });

  it('forwards the call of `addWidget` to the main index', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(search.mainIndex.getWidgets()).toHaveLength(0);

    expect(() => search.addWidget(createWidget())).toWarnDev(
      '[InstantSearch.js]: addWidget will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`'
    );

    expect(search.mainIndex.getWidgets()).toHaveLength(1);
  });

  it('forwards the call of `addWidgets` to the main index', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(search.mainIndex.getWidgets()).toHaveLength(0);

    search.addWidgets([createWidget()]);

    expect(search.mainIndex.getWidgets()).toHaveLength(1);
  });

  it('returns the search instance when calling `addWidget`', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    let result: InstantSearch | null = null;

    expect(() => {
      result = search.addWidget(createWidget());
    }).toWarnDev(
      '[InstantSearch.js]: addWidget will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`'
    );

    expect(result).toBe(search);
  });

  it('returns the search instance when calling `addWidgets`', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(search.addWidgets([createWidget()])).toBe(search);
  });
});

describe('removeWidget(s)', () => {
  beforeEach(() => {
    warning.cache = {};
  });

  it('forwards the call to `removeWidget` to the main index', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    expect(search.mainIndex.getWidgets()).toHaveLength(1);

    expect(() => search.removeWidget(widget)).toWarnDev(
      '[InstantSearch.js]: removeWidget will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`'
    );

    expect(search.mainIndex.getWidgets()).toHaveLength(0);
  });

  it('forwards the call to `removeWidgets` to the main index', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    expect(search.mainIndex.getWidgets()).toHaveLength(1);

    search.removeWidgets([widget]);

    expect(search.mainIndex.getWidgets()).toHaveLength(0);
  });

  it('returns the search instance when calling `removeWidget`', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    expect(() => search.addWidget(widget)).toWarnDev(
      '[InstantSearch.js]: addWidget will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`'
    );

    let result: InstantSearch | null = null;

    expect(() => {
      result = search.removeWidget(widget);
    }).toWarnDev(
      '[InstantSearch.js]: removeWidget will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`'
    );

    expect(result).toBe(search);
  });

  it('returns the search instance when calling `removeWidgets`', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();
    search.addWidgets([widget]);

    expect(search.removeWidgets([widget])).toBe(search);
  });
});

describe('start', () => {
  it('creates two Helper one for the instance + one for the index', () => {
    const searchClient = createSearchClient();
    const indexName = 'indexName';
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    expect(algoliasearchHelper).toHaveBeenCalledTimes(0);

    search.start();

    expect(algoliasearchHelper).toHaveBeenCalledTimes(2);
    expect(algoliasearchHelper).toHaveBeenCalledWith(searchClient, indexName);
  });

  it('replaces the regular `search` with `searchOnlyWithDerivedHelpers`', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.start();

    expect(
      search.mainHelper!.searchOnlyWithDerivedHelpers
    ).toHaveBeenCalledTimes(1);
  });

  it('calls the provided `searchFunction` with a single request', () => {
    const searchFunction = jest.fn(helper => helper.setQuery('test').search());
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchFunction,
      searchClient,
    });

    expect(searchFunction).toHaveBeenCalledTimes(0);
    expect(searchClient.search).toHaveBeenCalledTimes(0);

    search.start();

    expect(searchFunction).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(search.mainIndex.getHelper()!.state.query).toBe('test');
  });

  it('calls the provided `searchFunction` with multiple requests', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      searchFunction(helper) {
        const nextState = helper.state
          .addDisjunctiveFacet('brand')
          .addDisjunctiveFacetRefinement('brand', 'Apple');

        helper.setState(nextState).search();
      },
    });

    expect(() => {
      search.start();
    }).not.toThrow();
  });

  it('forwards the `initialUiState` to the main index', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          refinementList: {
            brand: ['Apple'],
          },
        },
      },
    });

    search.start();

    // @ts-expect-error
    expect(search.mainIndex.getWidgetUiState()).toEqual({
      indexName: {
        refinementList: {
          brand: ['Apple'],
        },
      },
    });
  });

  it('forwards the router state to the main index', () => {
    const router = {
      read: jest.fn(() => ({
        indexName: {
          hierarchicalMenu: {
            'hierarchicalCategories.lvl0': ['Cell Phones'],
          },
        },
      })),
      write: jest.fn(),
      onUpdate: jest.fn(),
      createURL: jest.fn(() => '#'),
      dispose: jest.fn(),
    };

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router,
      },
    });

    search.start();

    // @ts-expect-error
    expect(search.mainIndex.getWidgetUiState()).toEqual({
      indexName: {
        hierarchicalMenu: {
          'hierarchicalCategories.lvl0': ['Cell Phones'],
        },
      },
    });
  });

  it('calls `init` on the added widgets', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    expect(widget.init).toHaveBeenCalledTimes(1);
  });

  it('triggers a single search with `routing`', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      routing: true,
      searchClient,
    });

    expect(searchClient.search).toHaveBeenCalledTimes(0);

    search.start();

    await runAllMicroTasks();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  it('triggers a search without errors', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(searchClient.search).toHaveBeenCalledTimes(0);

    search.start();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  // eslint-disable-next-line jest/no-done-callback
  it('triggers a search with errors', done => {
    const searchClient = createSearchClient({
      // @ts-ignore (this fails in v4, not in v3, therefore not ts-expect-error)
      search: jest.fn(() => Promise.reject(new Error('SERVER_ERROR'))),
    });

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(searchClient.search).toHaveBeenCalledTimes(0);

    search.start();

    search.on('error', event => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(event.error).toEqual(new Error('SERVER_ERROR'));
      done();
    });
  });

  it('does start without widgets', () => {
    const searchClient = createSearchClient();
    const instance = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(() => instance.start()).not.toThrow();
  });

  it('does not to start twice', () => {
    const searchClient = createSearchClient();
    const instance = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(() => instance.start()).not.toThrow();
    expect(() => {
      instance.start();
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`start\` method has already been called once.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });
});

describe('dispose', () => {
  // eslint-disable-next-line jest/expect-expect
  it('cancels the scheduled search', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([createWidget(), createWidget()]);

    search.start();

    await runAllMicroTasks();

    // The call to `addWidgets` schedules a new search
    search.addWidgets([createWidget()]);

    search.dispose();

    // Without the cancel operation, the function call throws an error which
    // prevents the test to complete. We can't assert that the function throws
    // because we don't have access to the promise that throws in the first place.
    await runAllMicroTasks();
  });

  // eslint-disable-next-line jest/expect-expect
  it('cancels the scheduled render', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([createWidget(), createWidget()]);

    search.start();

    // We only wait for the search to schedule the render. We have now a render
    // that is scheduled, it will be processed in the next microtask if not canceled.
    await Promise.resolve();

    search.dispose();

    // Without the cancel operation, the function call throws an error which
    // prevents the test to complete. We can't assert that the function throws
    // because we don't have access to the promise that throws in the first place.
    await runAllMicroTasks();
  });

  // eslint-disable-next-line jest/expect-expect
  it('cancels the scheduled stalled render', async () => {
    const { searches, searchClient } = createControlledSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.addWidgets([createWidget(), createWidget()]);

    search.start();

    // Resolve the `search`
    searches[0].resolver();

    // Wait for the `render`
    await runAllMicroTasks();

    // Simulate a search
    search.mainHelper!.search();

    search.dispose();

    // Reaches the delay
    jest.runOnlyPendingTimers();

    // Without the cancel operation, the function call throws an error which
    // prevents the test to complete. We can't assert that the function throws
    // because we don't have access to the promise that throws in the first place.
    await runAllMicroTasks();
  });

  it('removes the widgets from the main index', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([createWidget(), createWidget()]);

    search.start();

    expect(search.mainIndex.getWidgets()).toHaveLength(2);

    search.dispose();

    expect(search.mainIndex.getWidgets()).toHaveLength(0);
  });

  it('calls `dispose` on the main index', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const mainIndexDispose = jest.spyOn(search.mainIndex, 'dispose');

    search.start();

    expect(mainIndexDispose).toHaveBeenCalledTimes(0);

    search.dispose();

    expect(mainIndexDispose).toHaveBeenCalledTimes(1);
  });

  it('stops the instance', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    expect(search.started).toBe(false);

    search.start();

    expect(search.started).toBe(true);

    search.dispose();

    expect(search.started).toBe(false);
  });

  it('removes the listeners on the main Helper', () => {
    const onEventName = jest.fn();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.start();

    const mainHelper = search.mainHelper!;

    mainHelper.on('searchQueueEmpty', onEventName);

    mainHelper.emit('searchQueueEmpty');

    expect(onEventName).toHaveBeenCalledTimes(1);

    search.dispose();

    mainHelper.emit('searchQueueEmpty');

    expect(onEventName).toHaveBeenCalledTimes(1);
  });

  it('removes the listeners on the instance', async () => {
    const onRender = jest.fn();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.on('render', onRender);

    search.start();

    await runAllMicroTasks();

    expect(onRender).toHaveBeenCalledTimes(1);

    search.dispose();

    onRender.mockClear();

    search.on('render', onRender);

    search.start();

    await runAllMicroTasks();

    expect(onRender).toHaveBeenCalledTimes(1);
  });

  it('removes the Helpers references', () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.start();

    expect(search.mainHelper).not.toBe(null);
    expect(search.helper).not.toBe(null);

    search.dispose();

    expect(search.mainHelper).toBe(null);
    expect(search.helper).toBe(null);

    search.start();

    expect(search.mainHelper).not.toBe(null);
    expect(search.helper).not.toBe(null);
  });
});

describe('scheduleSearch', () => {
  it('defers the call to the `search` method', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([createWidget()]);

    search.start();

    const mainHelperSearch = jest.spyOn(search.mainHelper!, 'search');

    search.scheduleSearch();

    expect(mainHelperSearch).toHaveBeenCalledTimes(0);

    await runAllMicroTasks();

    expect(mainHelperSearch).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls to the `search` method', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([createWidget()]);

    search.start();

    const mainHelperSearch = jest.spyOn(search.mainHelper!, 'search');

    search.scheduleSearch();
    search.scheduleSearch();
    search.scheduleSearch();
    search.scheduleSearch();

    expect(mainHelperSearch).toHaveBeenCalledTimes(0);

    await runAllMicroTasks();

    expect(mainHelperSearch).toHaveBeenCalledTimes(1);
  });
});

describe('scheduleRender', () => {
  it('defers the call to the `render` method', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    expect(widget.render).toHaveBeenCalledTimes(0);

    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls to the `render` method', async () => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    expect(widget.render).toHaveBeenCalledTimes(0);

    search.scheduleRender();
    search.scheduleRender();
    search.scheduleRender();
    search.scheduleRender();

    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(1);
  });

  // eslint-disable-next-line jest/no-done-callback
  it('emits a `render` event once the render is complete', done => {
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    expect(widget.render).toHaveBeenCalledTimes(0);

    search.on('render', () => {
      expect(widget.render).toHaveBeenCalledTimes(1);
      done();
    });
  });
});

describe('scheduleStalledRender', () => {
  it('calls the `render` method on the main index', async () => {
    const { searches, searchClient } = createControlledSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    // Resolve the `search`
    searches[0].resolver();

    // Wait for the `render`
    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(1);

    // Trigger a new search
    search.mainHelper!.search();

    // Reaches the delay
    jest.runOnlyPendingTimers();

    // Wait for the `render`
    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(2);
  });

  it('deduplicates the calls to the `render` method', async () => {
    const { searches, searchClient } = createControlledSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    search.start();

    // Resolve the `search`
    searches[0].resolver();

    // Wait for the `render`
    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(1);

    // Trigger multiple searches
    search.mainHelper!.search();
    search.mainHelper!.search();
    search.mainHelper!.search();
    search.mainHelper!.search();

    // Reaches the delay
    jest.runOnlyPendingTimers();

    // Wait for the `render`
    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(2);
  });

  it('triggers a `render` once the search expires the delay', async () => {
    const { searches, searchClient } = createControlledSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    const widget = createWidget();

    search.addWidgets([widget]);

    expect(widget.render).toHaveBeenCalledTimes(0);

    search.start();

    expect(widget.render).toHaveBeenCalledTimes(0);

    // Resolve the `search`
    searches[0].resolver();

    // Wait for the `render`
    await runAllMicroTasks();

    expect(widget.render).toHaveBeenCalledTimes(1);
    expect(widget.render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        searchMetadata: {
          isSearchStalled: false,
        },
      })
    );

    // Trigger a new search
    search.mainHelper!.search();

    expect(widget.render).toHaveBeenCalledTimes(1);

    // The delay is reached
    jest.runOnlyPendingTimers();

    // Wait for the `render`
    await runAllMicroTasks();

    // Widgets render because of the stalled search
    expect(widget.render).toHaveBeenCalledTimes(2);
    expect(widget.render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        searchMetadata: {
          isSearchStalled: true,
        },
      })
    );

    // Resolve the `search`
    searches[1].resolver();

    // Wait for the `render`
    await runAllMicroTasks();

    // Widgets render because of the results
    expect(widget.render).toHaveBeenCalledTimes(3);
    expect(widget.render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        searchMetadata: {
          isSearchStalled: false,
        },
      })
    );
  });
});

describe('createURL', () => {
  const createRouter = () => ({
    read: jest.fn(() => ({})),
    write: jest.fn(),
    onUpdate: jest.fn(),
    createURL: jest.fn(() => '#'),
    dispose: jest.fn(),
  });

  it('at top-level returns the default URL for the main index state', () => {
    const router = createRouter();
    router.createURL.mockImplementation(() => 'https://algolia.com');

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router,
      },
    });

    search.start();

    expect(search.createURL()).toBe('https://algolia.com');
  });

  it('at top-level returns a custom URL for the main index state', () => {
    const router = createRouter();
    router.createURL.mockImplementation(() => 'https://algolia.com');

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      routing: {
        router,
      },
    });

    search.addWidgets([connectSearchBox(noop)({})]);
    search.start();

    expect(search.createURL({ indexName: { query: 'Apple' } })).toBe(
      'https://algolia.com'
    );
  });

  it('returns the default URL for the main index state', () => {
    const router = createRouter();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          query: 'Apple',
        },
      },
      routing: {
        router,
      },
    });

    search.addWidgets([connectSearchBox(noop)({})]);
    search.start();
    search.createURL();

    expect(router.createURL).toHaveBeenCalledWith({
      indexName: {
        query: 'Apple',
      },
    });
  });

  it('returns the URL for nested index states', async () => {
    const router = createRouter();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          query: 'Google',
        },
        indexNameLvl1: {
          query: 'Samsung',
        },
        indexNameLvl2: {
          query: 'Google',
        },
      },
      routing: {
        router,
      },
    });

    search.addWidgets([
      connectSearchBox(noop)({}),
      index({ indexName: 'indexNameLvl1' }).addWidgets([
        connectSearchBox(noop)({}),
        index({ indexName: 'indexNameLvl2' }).addWidgets([
          connectSearchBox(noop)({}),
          connectPagination(noop)({}),
          createWidget({
            render({ helper, createURL }) {
              createURL(helper.state.setPage(3).setQuery('Apple'));
            },
          }),
        ]),
      ]),
    ]);

    search.start();

    // We need to run all micro tasks for the `render` method of the last
    // widget to be called and its `createURL` to be triggered.
    await runAllMicroTasks();

    expect(router.createURL).toHaveBeenCalledWith({
      indexName: {
        query: 'Google',
      },
      indexNameLvl1: {
        query: 'Samsung',
      },
      indexNameLvl2: {
        query: 'Apple',
        page: 4,
      },
    });
  });
});

describe('refresh', () => {
  it('calls `clearCache` on the main Helper', () => {
    const clearCache = jest.fn();
    const searchClient = createSearchClient({
      // @ts-expect-error
      clearCache,
    });

    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.start();

    expect(clearCache).toHaveBeenCalledTimes(0);

    search.refresh();

    expect(clearCache).toHaveBeenCalledTimes(1);
  });

  it('triggers a `search` with the cache emptied', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.start();

    // it is called once with start
    expect(searchClient.search).toHaveBeenCalledTimes(1);

    search.refresh();

    expect(searchClient.search).toHaveBeenCalledTimes(2);
  });
});

describe('use', () => {
  it('hooks middleware into the lifecycle before the instance starts', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });
    const button = document.createElement('button');
    const createSearchBox = connectSearchBox(({ refine }, isFirstRender) => {
      if (isFirstRender) {
        button.addEventListener('click', () => {
          refine('Trigger search');
        });
      }
    });
    const searchBox = createSearchBox({});
    const searchBoxInit = searchBox.init!;
    searchBox.init = jest.fn(args => searchBoxInit.bind(searchBox, args)());
    const middlewareSpy = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middleware = jest.fn(() => middlewareSpy);

    search.addWidgets([searchBox]);
    search.use(middleware);

    expect(middleware).toHaveBeenCalledTimes(1);
    expect(middleware).toHaveBeenCalledWith({ instantSearchInstance: search });

    // The subscriptions happen only once the search has started.
    expect(middlewareSpy.subscribe).toHaveBeenCalledTimes(0);

    search.start();

    const widgetsInitCallOrder = (searchBox.init as jest.Mock<any, any>).mock
      .invocationCallOrder[0];
    const middlewareSubscribeCallOrder =
      middlewareSpy.subscribe.mock.invocationCallOrder[0];
    // Checks that `mainIndex.init` was called before subscribing the middleware.
    expect(widgetsInitCallOrder).toBeLessThan(middlewareSubscribeCallOrder);

    await runAllMicroTasks();

    expect(middlewareSpy.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy.onStateChange).toHaveBeenCalledTimes(0);

    button.click();

    await runAllMicroTasks();

    expect(middlewareSpy.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {
          query: 'Trigger search',
        },
      },
    });

    search.dispose();

    await runAllMicroTasks();

    expect(middlewareSpy.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {},
      },
    });
    expect(middlewareSpy.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('hooks middleware into the lifecycle after the instance starts', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });
    const button = document.createElement('button');
    const searchBox = connectSearchBox(({ refine }, isFirstRender) => {
      if (isFirstRender) {
        button.addEventListener('click', () => {
          refine('Trigger search');
        });
      }
    });
    const middlewareBeforeStartSpy = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middlewareBeforeStart = jest.fn(() => middlewareBeforeStartSpy);
    const middlewareAfterStartSpy = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middlewareAfterStart = jest.fn(() => middlewareAfterStartSpy);

    search.addWidgets([searchBox({})]);
    search.use(middlewareBeforeStart);
    search.start();

    expect(middlewareBeforeStart).toHaveBeenCalledTimes(1);
    expect(middlewareBeforeStart).toHaveBeenCalledWith({
      instantSearchInstance: search,
    });

    search.use(middlewareAfterStart);

    // The first middleware should still have been only called once
    expect(middlewareBeforeStart).toHaveBeenCalledTimes(1);
    expect(middlewareAfterStart).toHaveBeenCalledTimes(1);
    expect(middlewareAfterStart).toHaveBeenCalledWith({
      instantSearchInstance: search,
    });

    await runAllMicroTasks();

    // The first middleware subscribe function should have been only called once
    expect(middlewareBeforeStartSpy.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareAfterStartSpy.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareBeforeStartSpy.onStateChange).toHaveBeenCalledTimes(0);
    expect(middlewareAfterStartSpy.onStateChange).toHaveBeenCalledTimes(0);

    button.click();

    await runAllMicroTasks();

    expect(middlewareBeforeStartSpy.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareAfterStartSpy.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareBeforeStartSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {
          query: 'Trigger search',
        },
      },
    });
    expect(middlewareAfterStartSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {
          query: 'Trigger search',
        },
      },
    });

    search.dispose();

    await runAllMicroTasks();

    expect(middlewareBeforeStartSpy.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareAfterStartSpy.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareBeforeStartSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {},
      },
    });
    expect(middlewareAfterStartSpy.onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {},
      },
    });
    expect(middlewareBeforeStartSpy.unsubscribe).toHaveBeenCalledTimes(1);
    expect(middlewareAfterStartSpy.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('unuse', () => {
  it('unsubscribes middleware', async () => {
    const indexName = 'indexName';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });
    const middlewareSpy1 = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middleware1 = jest.fn(() => middlewareSpy1);
    const middlewareSpy2 = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middleware2 = jest.fn(() => middlewareSpy2);

    search.addWidgets([connectSearchBox(noop)({})]);
    search.use(middleware1, middleware2);
    search.start();

    await runAllMicroTasks();

    expect(middlewareSpy1.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(0);
    expect(middlewareSpy2.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(0);

    search.renderState[indexName].searchBox!.refine('cat');
    await runAllMicroTasks();
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(1);

    search.renderState[indexName].searchBox!.refine('is');
    await runAllMicroTasks();
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(2);

    search.unuse(middleware1);

    expect(middlewareSpy1.unsubscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.unsubscribe).toHaveBeenCalledTimes(0);

    search.renderState[indexName].searchBox!.refine('good');
    await runAllMicroTasks();
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(3);
  });
});

describe('setUiState', () => {
  beforeEach(() => {
    warning.cache = {};
  });

  test('throws if the instance has not started', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    expect(() => {
      search.setUiState({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`start\` method needs to be called before \`setUiState\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
  });

  test('triggers a search', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.start();
    await runAllMicroTasks();
    expect(searchClient.search).toHaveBeenCalledTimes(1);

    search.setUiState({
      indexName: {},
    });
    await runAllMicroTasks();
    expect(searchClient.search).toHaveBeenCalledTimes(2);
  });

  test('notifies all middlewares', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });
    const onMiddlewareStateChange = jest.fn();
    const middleware = () => {
      return {
        subscribe() {},
        unsubscribe() {},
        onStateChange: onMiddlewareStateChange,
      };
    };

    search.use(middleware);
    search.start();
    expect(onMiddlewareStateChange).toHaveBeenCalledTimes(0);

    search.setUiState({
      indexName: {},
    });

    await runAllMicroTasks();

    expect(onMiddlewareStateChange).toHaveBeenCalledTimes(1);
    expect(onMiddlewareStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {},
      },
    });
  });

  test('notifies all middlewares in multi-index when called multiple times', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      index({ indexName: 'test' }),
    ]);

    const onMiddlewareStateChange = jest.fn();
    const middleware = () => {
      return {
        subscribe() {},
        unsubscribe() {},
        onStateChange: onMiddlewareStateChange,
      };
    };

    search.use(middleware);
    search.start();
    expect(onMiddlewareStateChange).toHaveBeenCalledTimes(0);

    search.setUiState({
      indexName: {},
      test: {},
    });

    await runAllMicroTasks();

    expect(onMiddlewareStateChange).toHaveBeenCalledTimes(1);
    expect(onMiddlewareStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {},
        test: {},
      },
    });

    search.setUiState({
      indexName: { query: 'test' },
      test: {},
    });

    await runAllMicroTasks();

    expect(onMiddlewareStateChange).toHaveBeenCalledTimes(2);
    expect(onMiddlewareStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: { query: 'test' },
        test: {},
      },
    });
  });

  test('with object form sets indices state', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
      index({
        indexName: 'nestedIndexName1',
      }).addWidgets([
        connectSearchBox(() => {})({}),
        index({
          indexName: 'nestedIndexName2',
        }).addWidgets([
          connectSearchBox(() => {})({}),
          connectPagination(() => {})({}),
        ]),
      ]),
      index({
        indexName: 'siblingIndexName1',
        indexId: 'siblingIndexId1',
      }).addWidgets([connectSearchBox(() => {})({})]),
    ]);
    search.start();

    search.setUiState({
      indexName: {
        query: 'Query',
        page: 3,
      },
      nestedIndexName1: {
        query: 'Query 2',
      },
      nestedIndexName2: {
        query: 'Query 3',
        page: 4,
      },
      siblingIndexId1: {
        query: 'Query 4',
      },
    });

    await runAllMicroTasks();

    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          query: 'Query',
          page: 2,
        }),
      },
      {
        indexName: 'nestedIndexName1',
        params: expect.objectContaining({
          query: 'Query 2',
          page: 2,
        }),
      },
      {
        indexName: 'nestedIndexName2',
        params: expect.objectContaining({
          query: 'Query 3',
          page: 3,
        }),
      },
      {
        indexName: 'siblingIndexName1',
        params: expect.objectContaining({
          query: 'Query 4',
        }),
      },
    ]);
  });

  test('with function form sets indices state', async () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      initialUiState: {
        indexName: {
          query: 'Initial query',
        },
        nestedIndexName2: {
          query: 'Nested query 2',
        },
      },
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
      index({
        indexName: 'nestedIndexName1',
      }).addWidgets([
        connectSearchBox(() => {})({}),
        index({
          indexName: 'nestedIndexName2',
        }).addWidgets([
          connectSearchBox(() => {})({}),
          connectPagination(() => {})({}),
        ]),
      ]),
      index({
        indexName: 'siblingIndexName1',
        indexId: 'siblingIndexId1',
      }).addWidgets([connectSearchBox(() => {})({})]),
    ]);
    search.start();

    search.setUiState(prevUiState => {
      expect(prevUiState).toEqual({
        indexName: {
          query: 'Initial query',
        },
        nestedIndexName1: {},
        nestedIndexName2: {
          query: 'Nested query 2',
        },
        siblingIndexId1: {},
      });

      return {
        ...prevUiState,
        indexName: {
          page: 2,
        },
      };
    });

    await runAllMicroTasks();

    search.setUiState(prevUiState => {
      expect(prevUiState).toEqual({
        indexName: {
          page: 2,
        },
        nestedIndexName1: {},
        nestedIndexName2: {
          query: 'Nested query 2',
        },
        siblingIndexId1: {},
      });

      return {
        indexName: {
          query: 'Query',
          page: 3,
        },
        nestedIndexName1: {
          query: 'Query 2',
        },
        nestedIndexName2: {
          query: 'Query 3',
          page: 4,
        },
        siblingIndexId1: {
          query: 'Query 4',
        },
      };
    });

    await runAllMicroTasks();

    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          query: 'Query',
          page: 2,
        }),
      },
      {
        indexName: 'nestedIndexName1',
        params: expect.objectContaining({
          query: 'Query 2',
          page: 2,
        }),
      },
      {
        indexName: 'nestedIndexName2',
        params: expect.objectContaining({
          query: 'Query 3',
          page: 3,
        }),
      },
      {
        indexName: 'siblingIndexName1',
        params: expect.objectContaining({
          query: 'Query 4',
        }),
      },
    ]);
  });

  it('warns if UI state contains unmounted widgets in development mode', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});

    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
    });

    search.start();

    expect(() => {
      search.setUiState({
        indexName: {
          query: 'Query',
          page: 2,
        },
      });
    })
      .toWarnDev(`[InstantSearch.js]: The UI state for the index "indexName" is not consistent with the widgets mounted.

This can happen when the UI state is specified via \`initialUiState\`, \`routing\` or \`setUiState\` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.

To fully reflect the state, some widgets need to be added to the index "indexName":

- \`query\` needs one of these widgets: "searchBox", "autocomplete", "voiceSearch"
- \`page\` needs one of these widgets: "pagination", "infiniteHits"

If you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don't render anything:

\`\`\`
const virtualSearchBox = connectSearchBox(() => null);
const virtualPagination = connectPagination(() => null);

search.addWidgets([
  virtualSearchBox({ /* ... */ }),
  virtualPagination({ /* ... */ })
]);
\`\`\`

If you're using custom widgets that do set these query parameters, we recommend using connectors instead.

See https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#customize-the-complete-ui-of-the-widgets`);
  });
});

describe('getUiState', () => {
  test('retrieves empty UI state without widgets', () => {
    const indexName = 'indexName';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    expect(search.getUiState()).toEqual({
      [indexName]: {},
    });
  });

  test('retrieves the ui state without refinements', () => {
    const indexName = 'indexName';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
    ]);

    expect(search.getUiState()).toEqual({
      [indexName]: {},
    });
  });

  test('retrieves the ui state without refinements (multi-index)', () => {
    const indexName = 'indexName';
    const secondIndexName = 'indexName2';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
      index({ indexName: secondIndexName }).addWidgets([
        connectSearchBox(() => {})({}),
      ]),
    ]);

    expect(search.getUiState()).toEqual({
      [indexName]: {},
      [secondIndexName]: {},
    });
  });

  test('retrieves the correct ui state after one refinement', () => {
    const indexName = 'indexName';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
    ]);

    search.start();

    (search.mainIndex.getWidgets()[0] as SearchBoxWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine('test');

    expect(search.getUiState()).toEqual({
      [indexName]: {
        query: 'test',
      },
    });
  });

  test('retrieves the correct ui state after multiple refinements', () => {
    const indexName = 'indexName';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
    ]);

    search.start();

    (search.mainIndex.getWidgets()[0] as SearchBoxWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine('test');

    (search.mainIndex.getWidgets()[1] as PaginationWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine(3);

    expect(search.getUiState()).toEqual({
      [indexName]: {
        query: 'test',
        page: 4,
      },
    });
  });

  test('retrieves the correct ui state after multiple refinements (multi-index)', () => {
    const indexName = 'indexName';
    const secondIndexName = 'indexName2';
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName,
      searchClient,
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectPagination(() => {})({}),
      index({ indexName: secondIndexName }).addWidgets([
        connectSearchBox(() => {})({}),
        connectPagination(() => {})({}),
      ]),
    ]);

    search.start();

    (search.mainIndex.getWidgets()[0] as SearchBoxWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine('test');

    (search.mainIndex.getWidgets()[1] as PaginationWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine(3);

    ((search.mainIndex.getWidgets()[2] as IndexWidget).getWidgets()[0] as SearchBoxWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine('test2');

    ((search.mainIndex.getWidgets()[2] as IndexWidget).getWidgets()[1] as PaginationWidgetInstance)
      .getWidgetRenderState(createRenderOptions())
      .refine(39);

    expect(search.getUiState()).toEqual({
      [indexName]: {
        query: 'test',
        page: 4,
      },
      [secondIndexName]: {
        query: 'test2',
        page: 40,
      },
    });
  });
});

describe('onStateChange', () => {
  test('does not trigger an internal state change', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      onStateChange() {},
    });
    const button = document.createElement('button');
    const searchBox = connectSearchBox(({ refine }, isFirstRender) => {
      if (isFirstRender) {
        button.addEventListener('click', () => {
          refine('Trigger search');
        });
      }
    });
    const middlewareOnStateChange = jest.fn();
    const middleware = () => {
      return {
        subscribe() {},
        unsubscribe() {},
        onStateChange: middlewareOnStateChange,
      };
    };

    search.addWidgets([searchBox({})]);
    search.use(middleware);
    search.start();

    expect(middlewareOnStateChange).toHaveBeenCalledTimes(0);

    button.click();

    expect(middlewareOnStateChange).toHaveBeenCalledTimes(0);
  });

  test('does not trigger a search', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      onStateChange() {},
    });
    const button = document.createElement('button');
    const searchBox = connectSearchBox(({ refine }, isFirstRender) => {
      if (isFirstRender) {
        button.addEventListener('click', () => {
          refine('Trigger search');
        });
      }
    });

    search.addWidgets([searchBox({})]);
    search.start();

    expect(searchClient.search).toHaveBeenCalledTimes(1);

    button.click();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  test('is triggered when the main index helper changes', () => {
    const searchClient = createSearchClient();
    const onStateChange = jest.fn(({ uiState, setUiState }) => {
      setUiState(uiState);
    });
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      onStateChange,
    });

    const inputRef = createRef();
    const buttonRef = createRef();

    const searchBox = connectSearchBox<{
      queryTriggered: string;
      container: HTMLElement;
    }>(({ refine, query, widgetParams }) => {
      render(
        <div>
          <input ref={inputRef} value={query} />
          <button
            ref={buttonRef}
            onClick={() => refine(widgetParams.queryTriggered)}
          >
            Trigger
          </button>
        </div>,
        widgetParams.container
      );
    });

    search.addWidgets([
      searchBox({
        container: document.createElement('div'),
        queryTriggered: 'Query',
      }),
    ]);
    search.start();

    expect(onStateChange).toHaveBeenCalledTimes(0);

    buttonRef.current.click();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {
          query: 'Query',
        },
      },
      setUiState: expect.any(Function),
    });
  });

  test("is triggered when nested indices' helper changes", () => {
    const searchClient = createSearchClient();
    const onStateChange = jest.fn(({ uiState, setUiState }) => {
      setUiState(uiState);
    });
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      onStateChange,
    });

    const container1 = document.createElement('div');
    const container2 = document.createElement('div');
    const container3 = document.createElement('div');
    const container4 = document.createElement('div');
    const buttonRef1 = createRef();
    const buttonRef2 = createRef();
    const buttonRef3 = createRef();
    const buttonRef4 = createRef();

    const searchBox = connectSearchBox<{
      queryTriggered: string;
      buttonRef: preact.RefObject<any>;
      container: HTMLElement;
    }>(({ refine, query, widgetParams }) => {
      render(
        <div>
          <input value={query} />
          <button
            ref={widgetParams.buttonRef}
            onClick={() => refine(widgetParams.queryTriggered)}
          >
            Trigger
          </button>
        </div>,
        widgetParams.container
      );
    });

    search.addWidgets([
      searchBox({
        container: container1,
        buttonRef: buttonRef1,
        queryTriggered: 'Query',
      }),
      index({ indexName: 'nestedIndex1' }).addWidgets([
        searchBox({
          container: container2,
          buttonRef: buttonRef2,
          queryTriggered: 'Nested query 1',
        }),
        index({ indexName: 'nestedIndex2' }).addWidgets([
          searchBox({
            container: container3,
            buttonRef: buttonRef3,
            queryTriggered: 'Nested query 2',
          }),
        ]),
      ]),
      index({ indexName: 'siblingIndex1' }).addWidgets([
        searchBox({
          container: container4,
          buttonRef: buttonRef4,
          queryTriggered: 'Sibling query 1',
        }),
      ]),
    ]);
    search.start();

    expect(onStateChange).toHaveBeenCalledTimes(0);

    buttonRef1.current.click();
    buttonRef2.current.click();
    buttonRef3.current.click();
    buttonRef4.current.click();

    expect(onStateChange).toHaveBeenCalledTimes(4);
    expect(onStateChange).toHaveBeenCalledWith({
      uiState: {
        indexName: {
          query: 'Query',
        },
        nestedIndex1: {
          query: 'Nested query 1',
        },
        nestedIndex2: {
          query: 'Nested query 2',
        },
        siblingIndex1: {
          query: 'Sibling query 1',
        },
      },
      setUiState: expect.any(Function),
    });
  });
});

describe('initialUiState', () => {
  it('warns if UI state contains unmounted widgets in development mode', () => {
    const searchClient = createSearchClient();
    const search = new InstantSearch({
      indexName: 'indexName',
      searchClient,
      initialUiState: {
        indexName: {
          query: 'First query',
          page: 3,
          refinementList: {
            brand: ['Apple'],
          },
          hierarchicalMenu: {
            categories: ['Mobile'],
          },
          range: {
            price: '100:200',
          },
          menu: {
            category: 'Hardware',
          },
          places: {
            query: 'Paris',
            position: '1,1',
          },
          // This is a UI parameter that is not supported by default but that
          // can be added when using custom widgets. Having it in `initialUiState`
          // makes sure that it doesn't throw if it happens.
          // @ts-expect-error
          customWidget: {
            query: 'Custom query',
          },
        },
      },
    });

    const searchBox = connectSearchBox(() => null)({});
    const customWidget = { $$type: 'custom.widget', render() {} };

    search.addWidgets([searchBox, customWidget]);

    expect(() => {
      search.start();
    })
      .toWarnDev(`[InstantSearch.js]: The UI state for the index "indexName" is not consistent with the widgets mounted.

This can happen when the UI state is specified via \`initialUiState\`, \`routing\` or \`setUiState\` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.

To fully reflect the state, some widgets need to be added to the index "indexName":

- \`page\` needs one of these widgets: "pagination", "infiniteHits"
- \`refinementList\` needs one of these widgets: "refinementList"
- \`hierarchicalMenu\` needs one of these widgets: "hierarchicalMenu"
- \`range\` needs one of these widgets: "rangeInput", "rangeSlider"
- \`menu\` needs one of these widgets: "menu", "menuSelect"
- \`places\` needs one of these widgets: "places"

If you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don't render anything:

\`\`\`
const virtualPagination = connectPagination(() => null);
const virtualRefinementList = connectRefinementList(() => null);
const virtualHierarchicalMenu = connectHierarchicalMenu(() => null);
const virtualRangeInput = connectRange(() => null);
const virtualMenu = connectMenu(() => null);

search.addWidgets([
  virtualPagination({ /* ... */ }),
  virtualRefinementList({ /* ... */ }),
  virtualHierarchicalMenu({ /* ... */ }),
  virtualRangeInput({ /* ... */ }),
  virtualMenu({ /* ... */ })
]);
\`\`\`

If you're using custom widgets that do set these query parameters, we recommend using connectors instead.

See https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#customize-the-complete-ui-of-the-widgets`);
  });
});
