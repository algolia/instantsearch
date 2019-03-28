import instantsearch from '../main';
import RoutingManager from '../RoutingManager';
import simpleMapping from '../stateMappings/simple';

const runAllMicroTasks = () => new Promise(setImmediate);

const createFakeSearchClient = () => ({
  search: () => Promise.resolve({ results: [{}] }),
});

const createFakeRouter = (args = {}) => ({
  onUpdate() {},
  write() {},
  read() {
    return {};
  },
  ...args,
});

const createFakeStateMapping = (args = {}) => ({
  stateToRoute(uiState) {
    return uiState;
  },
  routeToState(routeState) {
    return routeState;
  },
  ...args,
});

const createFakeSearchBox = () => ({
  render({ helper }) {
    this.refine = value => {
      helper.setQuery(value).search();
    };
  },
  dispose({ state }) {
    return state.setQuery();
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

const createFakeHitsPerPage = () => ({
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
  describe('getAllUIStates', () => {
    test('reads the state of widgets with a getWidgetState implementation', () => {
      const searchClient = createFakeSearchClient();
      const search = instantsearch({
        indexName: '',
        searchClient,
      });

      const widgetState = {
        some: 'values',
      };
      const widget = {
        render: () => {},
        getWidgetState: jest.fn(() => widgetState),
      };
      search.addWidget(widget);

      const actualInitialState = {
        some: 'values',
      };

      search.start();

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: simpleMapping(),
        router: {
          read: () => actualInitialState,
        },
      });

      const uiStates = router.getAllUIStates({
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
        some: 'values',
      };

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: simpleMapping(),
        router: {
          read: () => actualInitialState,
        },
      });

      const uiStates = router.getAllUIStates({
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
        some: 'values',
      };

      search.start();

      const router = new RoutingManager({
        instantSearchInstance: search,
        stateMapping: simpleMapping(),
        router: {
          read: () => actualInitialState,
        },
      });

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
        stateMapping: simpleMapping(),
        router: {
          read: () => {},
        },
      });

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

      const router = {
        write: jest.fn(),
        read: jest.fn(),
        onUpdate: () => {},
      };

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

      let onRouterUpdateCallback;
      const router = {
        write: jest.fn(),
        read: jest.fn(() => ({})),
        onUpdate: fn => {
          onRouterUpdateCallback = fn;
        },
      };

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

        expect(search.helper.state.query).toEqual('');

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

      const router = {
        write: jest.fn(),
        read: jest.fn(() => ({})),
        onUpdate: jest.fn(),
      };

      const stateMapping = {
        stateToRoute(uiState) {
          return {
            query: uiState.query && uiState.query.toUpperCase(),
          };
        },
        routeToState(routeState) {
          return routeState;
        },
      };

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

      const widget = {
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
      const stateMapping = createFakeStateMapping();
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

      const fakeSearchBox = createFakeSearchBox();
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

      // Trigger getConfigurartion
      search.removeWidget(fakeHitsPerPage);

      await runAllMicroTasks();

      expect(router.write).toHaveBeenCalledTimes(2);
      expect(router.write).toHaveBeenLastCalledWith({
        query: 'Apple',
      });
    });
  });
});
