/**
 * @jest-environment jsdom-global
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { createWidget } from 'instantsearch-core/test/createWidget';
import qs from 'qs';

import {
  instantsearch,
  historyRouter,
  connectHitsPerPage,
  connectSearchBox,
} from '..';

import type { Router, UiState, StateMapping, IndexUiState } from '../types';
import type { JSDOM } from 'jsdom';

declare const jsdom: JSDOM;

const createFakeRouter = (args: Partial<Router> = {}): Router => ({
  onUpdate(..._args) {},
  write(..._args) {},
  read() {
    return {};
  },
  createURL(..._args) {
    return '';
  },
  dispose() {
    return undefined;
  },
  ...args,
});

const createFakeStateMapping = (
  args: Partial<StateMapping> = {}
): StateMapping => ({
  stateToRoute(uiState) {
    return uiState;
  },
  routeToState(routeState) {
    return routeState;
  },
  ...args,
});

type HistoryState<TEntry> = {
  index: number;
  entries: TEntry[];
  listeners: Array<(value: TEntry) => void>;
};

const createFakeHistory = <TEntry = Record<string, unknown>>(
  {
    index = -1,
    entries = [],
    listeners = [],
  }: HistoryState<TEntry> = {} as HistoryState<TEntry>
) => {
  const state: HistoryState<TEntry> = {
    index,
    entries,
    listeners,
  };

  return {
    subscribe(listener: (entry: TEntry) => void) {
      state.listeners.push(listener);
    },
    push(value: TEntry) {
      state.entries.push(value);
      state.index++;
    },
    back() {
      state.index--;
      listeners.forEach((listener) => {
        listener(state.entries[state.index]);
      });
    },
  };
};

describe('RoutingManager', () => {
  describe('within instantsearch', () => {
    test('should write in the router on searchParameters change', async () => {
      const searchClient = createSearchClient();
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        routing: {
          router,
        },
      });

      const widget = createWidget({
        render: jest.fn(),
        getWidgetUiState: jest.fn((uiState, { searchParameters }) => ({
          ...uiState,
          q: searchParameters.query,
        })),
        getWidgetSearchParameters: jest.fn(
          (searchParameters) => searchParameters
        ),
      });

      search.addWidgets([widget]);

      search.start();

      // initialization is done at this point
      await wait(0);

      expect(widget.render).toHaveBeenCalledTimes(1);
      expect(widget.getWidgetSearchParameters).toHaveBeenCalledTimes(1);

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(0);

      search.mainIndex.getHelper()!.setQuery('q'); // routing write updates on change

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenCalledWith({
        indexName: {
          q: 'q',
        },
      });
    });

    // eslint-disable-next-line jest/no-done-callback
    test('should update the searchParameters on router state update', (done) => {
      const searchClient = createSearchClient();

      let onRouterUpdateCallback: (args: UiState) => void;
      const router = createFakeRouter({
        onUpdate: (fn) => {
          onRouterUpdateCallback = fn;
        },
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        routing: {
          router,
        },
      });

      const widget = createWidget({
        render: jest.fn(),
        getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
          searchParameters.setQuery(uiState.query!)
        ),
      });

      search.addWidgets([widget]);

      search.start();

      search.once('render', () => {
        // initialization is done at this point

        expect(search.mainIndex.getHelper()!.state.query).toBeUndefined();

        // this simulates a router update with a uiState of {query: 'a'}
        onRouterUpdateCallback({
          indexName: {
            query: 'a',
          },
        });

        search.once('render', () => {
          // the router update triggers a new search
          // and given that the widget reads q as a query parameter
          expect(search.mainIndex.getHelper()!.state.query).toEqual('a');
          done();
        });
      });
    });

    test('should keep the UI state up to date on state changes', async () => {
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({});
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        routing: {
          stateMapping,
          router,
        },
      });

      const fakeSearchBox = connectSearchBox(() => {})({});
      const fakeHitsPerPage = connectHitsPerPage(() => {})({
        items: [{ default: true, value: 1, label: 'one' }],
      });

      search.addWidgets([fakeSearchBox, fakeHitsPerPage]);

      search.start();

      await wait(0);

      // Trigger an update - push a change
      search.renderState.indexName.searchBox!.refine('Apple');

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });

      await wait(0);

      // Trigger change
      search.removeWidgets([fakeHitsPerPage]);

      await wait(0);

      // The UI state hasn't changed so `router.write` wasn't called a second
      // time
      expect(router.write).toHaveBeenCalledTimes(1);
    });

    test('should keep the UI state up to date on router.update', async () => {
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({});
      const history = createFakeHistory<UiState>();
      const router = createFakeRouter({
        onUpdate(fn) {
          history.subscribe((state) => {
            fn(state);
          });
        },
        write: jest.fn((state) => {
          history.push(state);
        }),
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        routing: {
          router,
          stateMapping,
        },
      });

      const fakeSearchBox = connectSearchBox(() => {})({});
      const fakeHitsPerPage = connectHitsPerPage(() => {})({
        items: [{ default: true, value: 1, label: 'one' }],
      });

      search.addWidgets([fakeSearchBox, fakeHitsPerPage]);

      search.start();

      await wait(0);

      // Trigger an update - push a change
      search.renderState.indexName.searchBox!.refine('Apple');

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });

      // Trigger an update - push a change
      search.renderState.indexName.searchBox!.refine('Apple iPhone');

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple iPhone',
        },
      });

      await wait(0);

      // Trigger an update - Apple iPhone → Apple
      history.back();

      await wait(0);

      // Trigger change
      search.removeWidgets([fakeHitsPerPage]);

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(3);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });
    });

    test('skips duplicate route state entries', async () => {
      let triggerChange = false;
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({
        stateToRoute(uiState) {
          if (triggerChange) {
            return {
              ...uiState,
              indexName: {
                ...uiState.indexName,
                triggerChange,
              },
            };
          }

          return uiState;
        },
      });
      const history = createFakeHistory<UiState>();
      const router = createFakeRouter({
        onUpdate(fn) {
          history.subscribe((state) => {
            fn(state);
          });
        },
        write: jest.fn((state) => {
          history.push(state);
        }),
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
        routing: {
          router,
          stateMapping,
        },
      });

      const fakeSearchBox = connectSearchBox(() => {})({});
      const fakeHitsPerPage1 = connectHitsPerPage(() => {})({
        items: [{ default: true, value: 1, label: 'one' }],
      });
      const fakeHitsPerPage2 = connectHitsPerPage(() => {})({
        items: [{ default: true, value: 1, label: 'one' }],
      });

      search.addWidgets([fakeSearchBox, fakeHitsPerPage1, fakeHitsPerPage2]);

      search.start();

      await wait(0);

      // Trigger an update - push a change
      search.renderState.indexName.searchBox!.refine('Apple');

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });

      // Trigger change without UI state change
      search.removeWidgets([fakeHitsPerPage1]);

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(1);

      await wait(0);

      triggerChange = true;
      // Trigger change without UI state change but with a route change
      search.removeWidgets([fakeHitsPerPage2]);

      await wait(0);

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
          triggerChange: true,
        },
      });
    });
  });

  describe('windowTitle', () => {
    test('should update the window title with URL query params on first render', async () => {
      jsdom.reconfigure({
        url: 'https://website.com/?query=query',
      });

      const setWindowTitle = jest.spyOn(window.document, 'title', 'set');
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({});
      const router = historyRouter({
        windowTitle(routeState) {
          return `Searching for "${routeState.query}"`;
        },
      });

      const search = instantsearch({
        indexName: 'instant_search',
        searchClient,
        routing: {
          router,
          stateMapping,
        },
      });

      const fakeSearchBox = connectSearchBox(() => {})({});

      search.addWidgets([fakeSearchBox]);
      search.start();

      await wait(0);

      expect(setWindowTitle).toHaveBeenCalledTimes(1);
      expect(setWindowTitle).toHaveBeenLastCalledWith('Searching for "query"');

      setWindowTitle.mockRestore();
    });
  });

  describe('parseURL', () => {
    const createFakeUrlWithRefinements: ({
      length,
    }: {
      length: number;
    }) => string = ({ length }) =>
      [
        'https://website.com/',
        Array.from(
          { length },
          (_v, i) => `refinementList[brand][${i}]=brand-${i}`
        ).join('&'),
      ].join('?');

    test('should parse refinements with more than 20 filters per category as array', () => {
      jsdom.reconfigure({
        url: createFakeUrlWithRefinements({ length: 22 }),
      });

      const router = historyRouter<IndexUiState>();
      // @ts-expect-error: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const parsedUrl = router.parseURL({
        qsModule: qs,
        currentURL: new URL(window.location.href),
      });

      expect(parsedUrl.refinementList!.brand).toBeInstanceOf(Array);
      expect(parsedUrl).toMatchInlineSnapshot(`
        {
          "refinementList": {
            "brand": [
              "brand-0",
              "brand-1",
              "brand-2",
              "brand-3",
              "brand-4",
              "brand-5",
              "brand-6",
              "brand-7",
              "brand-8",
              "brand-9",
              "brand-10",
              "brand-11",
              "brand-12",
              "brand-13",
              "brand-14",
              "brand-15",
              "brand-16",
              "brand-17",
              "brand-18",
              "brand-19",
              "brand-20",
              "brand-21",
            ],
          },
        }
      `);
    });

    test('should support returning 100 refinements as array', () => {
      jsdom.reconfigure({
        url: createFakeUrlWithRefinements({ length: 100 }),
      });

      const router = historyRouter<IndexUiState>();
      // @ts-expect-error: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const parsedUrl = router.parseURL({
        qsModule: qs,
        currentURL: new URL(window.location.href),
      });

      expect(parsedUrl.refinementList!.brand).toBeInstanceOf(Array);
    });
  });

  describe('createURL', () => {
    it('returns an URL for a `routeState` with refinements', () => {
      const router = historyRouter<IndexUiState>();
      const actual = router.createURL({
        query: 'iPhone',
        page: 5,
      });

      expect(actual).toBe('https://website.com/?query=iPhone&page=5');
    });

    it('returns an URL for an empty `routeState` with index', () => {
      const router = historyRouter();
      const actual = router.createURL({
        indexName: {},
      });

      expect(actual).toBe('https://website.com/');
    });

    it('returns an URL for an empty `routeState`', () => {
      const router = historyRouter();
      const actual = router.createURL({});

      expect(actual).toBe('https://website.com/');
    });
  });
});
