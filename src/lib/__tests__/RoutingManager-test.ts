/* globals jsdom */
import qs from 'qs';
import instantsearch from '../main';
import RoutingManager from '../RoutingManager';
import historyRouter from '../routers/history';
import { Router, Widget, StateMapping, RouteState } from '../../types';

const runAllMicroTasks = (): Promise<any> => new Promise(setImmediate);

type FakeSearchClient = {
  search: (query: string) => Promise<{ results: object[] }>;
};

const createFakeSearchClient = (): FakeSearchClient => ({
  search: () => Promise.resolve({ results: [{}] }),
});

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

const createFakeSearchBox = (): Widget => ({
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

const createFakeHitsPerPage = (): Widget => ({
  render() {},
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
  const defaultRouter: Router = {
    onUpdate: (..._args) => {},
    read: () => ({}),
    write: () => {},
    createURL: () => '#',
    dispose: () => {},
  };

  describe('getAllUiStates', () => {
    test('reads the state of widgets with a getWidgetState implementation', () => {
      const searchClient = createFakeSearchClient();
      const search = instantsearch({
        indexName: '',
        searchClient,
      });

      const widgetState = {
        query: 'query',
      };
      const widget = {
        render: () => {},
        getWidgetState: jest.fn(() => widgetState),
      };
      search.addWidget(widget);

      const actualInitialState = {
        query: 'query',
      };

      search.start();

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: createFakeStateMapping({}),
        router: {
          ...defaultRouter,
          read: () => actualInitialState,
        },
      });

      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const uiStates = router.getAllUiStates({
        searchParameters: search.helper.state,
      });
      expect(uiStates).toEqual(widgetState);

      expect(widget.getWidgetState).toHaveBeenCalledTimes(1);
      expect(widget.getWidgetState).toHaveBeenCalledWith(
        {},
        {
          helper: search.helper,
          searchParameters: search.helper.state,
        }
      );
    });

    test('Does not read UI state from widgets without an implementation of getWidgetState', () => {
      const searchClient = createFakeSearchClient();
      const search = instantsearch({
        indexName: '',
        searchClient,
      });

      search.addWidget({
        render: () => {},
      });

      search.start();

      const actualInitialState = {
        query: 'query',
      };

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: createFakeStateMapping({}),
        router: {
          ...defaultRouter,
          read: () => actualInitialState,
        },
      });

      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const uiStates = router.getAllUiStates({
        searchParameters: search.helper.state,
      });
      expect(uiStates).toEqual({});
    });
  });

  describe('getAllSearchParameters', () => {
    test('should get searchParameters from widget that implements getWidgetSearchParameters', () => {
      const searchClient = createFakeSearchClient();
      const search = instantsearch({
        indexName: '',
        searchClient,
      });

      const widget = {
        render: () => {},
        getWidgetSearchParameters: jest.fn(sp => sp.setQuery('test')),
      };
      search.addWidget(widget);

      const actualInitialState = {
        query: 'query',
      };

      search.start();

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: createFakeStateMapping({}),
        router: {
          ...defaultRouter,
          read: () => actualInitialState,
        },
      });

      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const searchParameters = router.getAllSearchParameters({
        currentSearchParameters: search.helper.state,
        uiState: {},
      });
      expect(searchParameters).toEqual(search.helper.state.setQuery('test'));

      expect(widget.getWidgetSearchParameters).toHaveBeenCalledTimes(1);
      expect(widget.getWidgetSearchParameters).toHaveBeenCalledWith(
        search.helper.state,
        {
          uiState: {},
        }
      );
    });

    test('should not change the searchParameters if no widget has a getWidgetSearchParameters', () => {
      const searchClient = createFakeSearchClient();
      const search = instantsearch({
        indexName: '',
        searchClient,
      });

      const widget = {
        render: () => {},
      };
      search.addWidget(widget);

      search.start();

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: createFakeStateMapping({}),
        router: {
          ...defaultRouter,
          read: () => ({}),
        },
      });

      // @ts-ignore: This method is considered private but we still use it
      // in the test after the TypeScript migration.
      // In a next refactor, we can consider changing this test implementation.
      const searchParameters = router.getAllSearchParameters({
        currentSearchParameters: search.helper.state,
        uiState: {},
      });
      expect(searchParameters).toEqual(search.helper.state);
    });
  });

  describe('within instantsearch', () => {
    test('should write in the router on searchParameters change', done => {
      const searchClient = createFakeSearchClient();
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'instant_search',
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
        getWidgetSearchParameters: jest.fn(),
      };

      search.addWidget(widget);

      search.start();

      search.once('render', () => {
        // initialization is done at this point
        expect(widget.render).toHaveBeenCalledTimes(1);
        expect(widget.getWidgetSearchParameters).toHaveBeenCalledTimes(1);

        expect(router.write).toHaveBeenCalledTimes(0);

        search.helper.setQuery('q'); // routing write updates on change

        expect(router.write).toHaveBeenCalledTimes(1);
        expect(router.write).toHaveBeenCalledWith({
          q: 'q',
        });

        done();
      });
    });

    test('should update the searchParameters on router state update', done => {
      const searchClient = createFakeSearchClient();

      let onRouterUpdateCallback: (args: object) => void;
      const router = createFakeRouter({
        onUpdate: fn => {
          onRouterUpdateCallback = fn;
        },
      });

      const search = instantsearch({
        indexName: 'instant_search',
        searchClient,
        routing: {
          router,
        },
      });

      const widget = {
        render: jest.fn(),
        getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
          searchParameters.setQuery(uiState.q)
        ),
      };
      search.addWidget(widget);

      search.start();

      search.once('render', () => {
        // initialization is done at this point

        expect(search.helper.state.query).toBeUndefined();

        // this simulates a router update with a uiState of {q: 'a'}
        onRouterUpdateCallback({
          q: 'a',
        });

        search.once('render', () => {
          // the router update triggers a new search
          // and given that the widget reads q as a query parameter
          expect(search.helper.state.query).toEqual('a');
          done();
        });
      });
    });

    test('should apply state mapping on differences after searchfunction', done => {
      const searchClient = createFakeSearchClient();

      const router = createFakeRouter({
        write: jest.fn(),
      });

      const stateMapping = createFakeStateMapping({
        stateToRoute(uiState) {
          return {
            query: uiState.query && uiState.query.toUpperCase(),
          };
        },
      });

      const search = instantsearch({
        indexName: 'instant_search',
        searchFunction: helper => {
          helper.setQuery('test').search();
        },
        searchClient,
        routing: {
          stateMapping,
          router,
        },
      });

      const widget: Widget = {
        render: jest.fn(),
        getWidgetSearchParameters: jest.fn(),
        getWidgetState(uiState, { searchParameters }) {
          return {
            ...uiState,
            query: searchParameters.query,
          };
        },
      };
      search.addWidget(widget);

      search.start();

      search.once('render', () => {
        // initialization is done at this point

        expect(search.helper.state.query).toEqual('test');

        expect(router.write).toHaveBeenLastCalledWith({
          query: 'TEST',
        });

        done();
      });
    });

    test('should keep the UI state up to date on state changes', async () => {
      const searchClient = createFakeSearchClient();
      const stateMapping = createFakeStateMapping({});
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'instant_search',
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
        query: 'Apple',
      });

      await runAllMicroTasks();

      // Trigger getConfiguration
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        query: 'Apple',
      });
    });

    test('should keep the UI state up to date on first render', async () => {
      const searchClient = createFakeSearchClient();
      const stateMapping = createFakeStateMapping({});
      const router = createFakeRouter({
        write: jest.fn(),
      });

      const search = instantsearch({
        indexName: 'instant_search',
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
        query: 'Apple iPhone',
      });

      // Trigger getConfiguration
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        query: 'Apple iPhone',
      });
    });

    test('should keep the UI state up to date on router.update', async () => {
      const searchClient = createFakeSearchClient();
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
        indexName: 'instant_search',
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
        query: 'Apple',
      });

      // Trigger an update - push a change
      fakeSearchBox.refine('Apple iPhone');

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        query: 'Apple iPhone',
      });

      await runAllMicroTasks();

      // Trigger an update - Apple iPhone → Apple
      history.back();

      await runAllMicroTasks();

      // Trigger getConfiguration
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(3);
      expect(router.write).toHaveBeenLastCalledWith({
        query: 'Apple',
      });
    });
  });

  describe('windowTitle', () => {
    test('should update the window title with URL query params on first render', async () => {
      jsdom.reconfigure({
        url: 'https://website.com/?query=query',
      });

      const setWindowTitle = jest.spyOn(window.document, 'title', 'set');
      const searchClient = createFakeSearchClient();
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
