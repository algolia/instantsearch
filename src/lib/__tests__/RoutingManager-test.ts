/* globals jsdom */

import qs from 'qs';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import { createWidget } from '../../../test/mock/createWidget';
import { runAllMicroTasks } from '../../../test/utils/runAllMicroTasks';
import { Router, Widget, UiState, StateMapping, RouteState } from '../../types';
import historyRouter from '../routers/history';
import instantsearch from '../main';

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

type HistoryState = {
  index: number;
  entries: object[];
  listeners: Array<(value: object) => void>;
};

const createFakeHistory = (
  {
    index = -1,
    entries = [],
    listeners = [],
  }: HistoryState = {} as HistoryState
): any => {
  const state: HistoryState = {
    index,
    entries,
    listeners,
  };

  return {
    subscribe(listener: () => void) {
      state.listeners.push(listener);
    },
    push(value: object) {
      state.entries.push(value);
      state.index++;
    },
    back() {
      state.index--;
      listeners.forEach(listener => {
        listener(state.entries[state.index]);
      });
    },
  };
};

const createFakeSearchBox = (): Widget =>
  createWidget({
    render({ helper }) {
      (this as any).refine = (value: string) => {
        helper.setQuery(value).search();
      };
    },
    dispose({ state }) {
      return state.setQuery('');
    },
    getWidgetSearchParameters(searchParameters, { uiState }) {
      return searchParameters.setQuery(uiState.query || '');
    },
    getWidgetState(uiState, { searchParameters }) {
      return {
        ...uiState,
        query: searchParameters.query,
      };
    },
  });

const createFakeHitsPerPage = (): Widget =>
  createWidget({
    dispose({ state }) {
      return state;
    },
    getWidgetSearchParameters(parameters) {
      return parameters;
    },
    getWidgetState(uiState) {
      return uiState;
    },
  });

describe('RoutingManager', () => {
  describe('within instantsearch', () => {
    test('should write in the router on searchParameters change', done => {
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

      const widget = {
        render: jest.fn(),
        getWidgetState: jest.fn((uiState, { searchParameters }) => ({
          ...uiState,
          q: searchParameters.query,
        })),
        getWidgetSearchParameters: jest.fn(
          searchParameters => searchParameters
        ),
      };

      search.addWidget(widget);

      search.start();

      search.once('render', () => {
        // initialization is done at this point
        expect(widget.render).toHaveBeenCalledTimes(1);
        expect(widget.getWidgetSearchParameters).toHaveBeenCalledTimes(1);

        expect(router.write).toHaveBeenCalledTimes(0);

        search.mainIndex.getHelper()!.setQuery('q'); // routing write updates on change

        expect(router.write).toHaveBeenCalledTimes(1);
        expect(router.write).toHaveBeenCalledWith({
          indexName: {
            q: 'q',
          },
        });

        done();
      });
    });

    test('should update the searchParameters on router state update', done => {
      const searchClient = createSearchClient();

      let onRouterUpdateCallback: (args: UiState) => void;
      const router = createFakeRouter({
        onUpdate: fn => {
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

      const widget = {
        render: jest.fn(),
        getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
          searchParameters.setQuery(uiState.query)
        ),
      };

      search.addWidget(widget);

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

    test('should apply state mapping on differences after searchfunction', done => {
      const searchClient = createSearchClient();

      const router = createFakeRouter({
        write: jest.fn(),
      });

      const stateMapping = createFakeStateMapping({
        stateToRoute(uiState) {
          return Object.keys(uiState).reduce((state, indexId) => {
            const indexState = uiState[indexId];

            return {
              ...state,
              [indexId]: {
                query: indexState.query && indexState.query.toUpperCase(),
              },
            };
          }, {});
        },
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchFunction: helper => {
          helper.setQuery('test').search();
        },
        searchClient,
        routing: {
          stateMapping,
          router,
        },
      });

      search.addWidget(
        createWidget({
          getWidgetState(uiState, { searchParameters }) {
            return {
              ...uiState,
              query: searchParameters.query,
            };
          },
          getWidgetSearchParameters: jest.fn(
            searchParameters => searchParameters
          ),
        })
      );

      search.start();

      search.once('render', () => {
        // initialization is done at this point

        expect(search.mainIndex.getHelper()!.state.query).toEqual('test');

        expect(router.write).toHaveBeenLastCalledWith({
          indexName: {
            query: 'TEST',
          },
        });

        done();
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

      const fakeSearchBox: any = createFakeSearchBox();
      const fakeHitsPerPage = createFakeHitsPerPage();

      search.addWidget(fakeSearchBox);
      search.addWidget(fakeHitsPerPage);

      search.start();

      await runAllMicroTasks();

      // Trigger an update - push a change
      fakeSearchBox.refine('Apple');

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });

      await runAllMicroTasks();

      // Trigger change
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });
    });

    test('should keep the UI state up to date on first render', async () => {
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({});
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'indexName',
        searchFunction(helper) {
          // Force the value of the query
          helper.setQuery('Apple iPhone').search();
        },
        searchClient,
        routing: {
          router,
          stateMapping,
        },
      });

      const fakeSearchBox = createFakeSearchBox();
      const fakeHitsPerPage = createFakeHitsPerPage();

      search.addWidget(fakeSearchBox);
      search.addWidget(fakeHitsPerPage);

      // Trigger the call to `searchFunction` -> Apple iPhone
      search.start();

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple iPhone',
        },
      });

      // Trigger change
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple iPhone',
        },
      });
    });

    test('should keep the UI state up to date on router.update', async () => {
      const searchClient = createSearchClient();
      const stateMapping = createFakeStateMapping({});
      const history = createFakeHistory();
      const router = createFakeRouter({
        onUpdate(fn) {
          history.subscribe(state => {
            fn(state);
          });
        },
        write: jest.fn(state => {
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

      const fakeSearchBox: any = createFakeSearchBox();
      const fakeHitsPerPage = createFakeHitsPerPage();

      search.addWidget(fakeSearchBox);
      search.addWidget(fakeHitsPerPage);

      search.start();

      await runAllMicroTasks();

      // Trigger an update - push a change
      fakeSearchBox.refine('Apple');

      expect(router.write).toHaveBeenCalledTimes(1);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
        },
      });

      // Trigger an update - push a change
      fakeSearchBox.refine('Apple iPhone');

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple iPhone',
        },
      });

      await runAllMicroTasks();

      // Trigger an update - Apple iPhone → Apple
      history.back();

      await runAllMicroTasks();

      // Trigger change
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(3);
      expect(router.write).toHaveBeenLastCalledWith({
        indexName: {
          query: 'Apple',
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
        windowTitle(routeState: RouteState) {
          return `Searching for "${routeState.query}"`;
        },
      } as any);

      const search = instantsearch({
        indexName: 'instant_search',
        searchClient,
        routing: {
          router,
          stateMapping,
        },
      });

      const fakeSearchBox = createFakeSearchBox();

      search.addWidget(fakeSearchBox);
      search.start();

      await runAllMicroTasks();

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

      const router = historyRouter();
      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const parsedUrl = router.parseURL({
        qsModule: qs,
        location: window.location,
      });

      expect(parsedUrl.refinementList.brand).toBeInstanceOf(Array);
      expect(parsedUrl).toMatchInlineSnapshot(`
        Object {
          "refinementList": Object {
            "brand": Array [
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

      const router = historyRouter();
      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const parsedUrl = router.parseURL({
        qsModule: qs,
        location: window.location,
      });

      expect(parsedUrl.refinementList.brand).toBeInstanceOf(Array);
    });
  });
});
