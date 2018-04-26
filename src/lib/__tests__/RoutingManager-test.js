import instantsearch from '../main.js';
import RoutingManager from '../RoutingManager.js';
import simpleMapping from '../stateMappings/simple.js';

const makeFakeAlgoliaClient = () => ({
  search: () => Promise.resolve({ results: [{}] }),
});

describe('RoutingManager', () => {
  describe('getAllUIStates', () => {
    test('reads the state of widgets with a getWidgetState implementation', () => {
      const search = instantsearch({
        appId: '',
        apiKey: '',
        indexName: '',
        createAlgoliaClient: makeFakeAlgoliaClient,
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
      const search = instantsearch({
        appId: '',
        apiKey: '',
        indexName: '',
        createAlgoliaClient: makeFakeAlgoliaClient,
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
      const search = instantsearch({
        appId: '',
        apiKey: '',
        indexName: '',
        createAlgoliaClient: makeFakeAlgoliaClient,
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
      const search = instantsearch({
        appId: '',
        apiKey: '',
        indexName: '',
        createAlgoliaClient: makeFakeAlgoliaClient,
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
      let onUpdateCallback; // eslint-disable-line
      const router = {
        write: jest.fn(),
        read: jest.fn(),
        onUpdate: fn => {
          onUpdateCallback = fn;
        },
      };
      const search = instantsearch({
        appId: 'latency',
        apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
        indexName: 'ikea',
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
      let onRouterUpdateCallback;
      const router = {
        write: jest.fn(),
        read: jest.fn(() => ({})),
        onUpdate: fn => {
          onRouterUpdateCallback = fn;
        },
      };
      const search = instantsearch({
        appId: 'latency',
        apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
        indexName: 'ikea',
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
        appId: 'latency',
        apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
        indexName: 'ikea',
        routing: {
          router,
          stateMapping,
        },
        searchFunction: helper => {
          helper.setQuery('test').search();
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
  });
});
