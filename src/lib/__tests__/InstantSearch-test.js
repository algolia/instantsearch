import range from 'lodash/range';
import times from 'lodash/times';
import sinon from 'sinon';

import algoliaSearchHelper from 'algoliasearch-helper';
import InstantSearch from '../InstantSearch';

describe('InstantSearch lifecycle', () => {
  let algoliasearch;
  let helperStub;
  let client;
  let helper;
  let appId;
  let apiKey;
  let indexName;
  let searchParameters;
  let search;
  let helperSearchSpy;
  let urlSync;

  beforeEach(() => {
    client = { algolia: 'client' };
    helper = algoliaSearchHelper(client);

    // when using searchFunction, we lose the reference to
    // the original helper.search
    const spy = sinon.spy();

    helper.search = spy;
    helperSearchSpy = spy;

    urlSync = {
      createURL: sinon.spy(),
      onHistoryChange: () => {},
      getConfiguration: sinon.spy(),
      render: () => {},
    };

    algoliasearch = sinon.stub().returns(client);
    helperStub = sinon.stub().returns(helper);

    appId = 'appId';
    apiKey = 'apiKey';
    indexName = 'lifecycle';

    searchParameters = {
      some: 'configuration',
      values: [-2, -1],
      index: indexName,
      another: { config: 'parameter' },
    };

    InstantSearch.__Rewire__('urlSyncWidget', () => urlSync);
    InstantSearch.__Rewire__('algoliasearch', algoliasearch);
    InstantSearch.__Rewire__('algoliasearchHelper', helperStub);

    search = new InstantSearch({
      appId,
      apiKey,
      indexName,
      searchParameters,
      urlSync: {},
    });
  });

  afterEach(() => {
    InstantSearch.__ResetDependency__('urlSyncWidget');
    InstantSearch.__ResetDependency__('algoliasearch');
    InstantSearch.__ResetDependency__('algoliasearchHelper');
  });

  it('calls algoliasearch(appId, apiKey)', () => {
    expect(algoliasearch.calledOnce).toBe(true, 'algoliasearch called once');
    expect(algoliasearch.args[0]).toEqual([appId, apiKey]);
  });

  it('does not call algoliasearchHelper', () => {
    expect(helperStub.notCalled).toBe(
      true,
      'algoliasearchHelper not yet called'
    );
  });

  describe('when providing a custom client module', () => {
    let createAlgoliaClient;
    let customAppID;
    let customApiKey;

    beforeEach(() => {
      // InstantSearch is being called once at the top-level context, so reset the `algoliasearch` spy
      algoliasearch.resetHistory();

      // Create a spy to act as a clientInstanceFunction that returns a custom client
      createAlgoliaClient = sinon.stub().returns(client);
      customAppID = 'customAppID';
      customApiKey = 'customAPIKey';

      // Create a new InstantSearch instance with custom client function
      search = new InstantSearch({
        appId: customAppID,
        apiKey: customApiKey,
        indexName,
        searchParameters,
        urlSync: {},
        createAlgoliaClient,
      });
    });

    it('does not call algoliasearch directly', () => {
      expect(algoliasearch.calledOnce).toBe(false, 'algoliasearch not called');
    });

    it('calls createAlgoliaClient(appId, apiKey)', () => {
      expect(createAlgoliaClient.calledOnce).toBe(
        true,
        'clientInstanceFunction called once'
      );
      expect(createAlgoliaClient.args[0]).toEqual([
        algoliasearch,
        customAppID,
        customApiKey,
      ]);
    });
  });

  describe('when adding a widget without render and init', () => {
    let widget;

    beforeEach(() => {
      widget = {};
    });

    it('throw an error', () => {
      expect(() => {
        search.addWidget(widget);
      }).toThrow('Widget definition missing render or init method');
    });
  });

  it('does not fail when passing same references inside multiple searchParameters props', () => {
    const disjunctiveFacetsRefinements = { fruits: ['apple'] };
    const facetsRefinements = disjunctiveFacetsRefinements;
    search = new InstantSearch({
      appId,
      apiKey,
      indexName,
      searchParameters: {
        disjunctiveFacetsRefinements,
        facetsRefinements,
      },
    });
    search.addWidget({
      getConfiguration: () => ({
        disjunctiveFacetsRefinements: { fruits: ['orange'] },
      }),
      init: () => {},
    });
    search.start();
    expect(search.searchParameters.facetsRefinements).toEqual({
      fruits: ['apple'],
    });
  });

  describe('when adding a widget', () => {
    let widget;

    beforeEach(() => {
      widget = {
        getConfiguration: sinon
          .stub()
          .returns({ some: 'modified', another: { different: 'parameter' } }),
        init: sinon.spy(() => {
          helper.state.sendMeToUrlSync = true;
        }),
        render: sinon.spy(),
      };
      search.addWidget(widget);
    });

    it('does not call widget.getConfiguration', () => {
      expect(widget.getConfiguration.notCalled).toBe(true);
    });

    describe('when we call search.start', () => {
      beforeEach(() => {
        search.start();
      });

      it('calls widget.getConfiguration(searchParameters)', () => {
        expect(widget.getConfiguration.args[0]).toEqual([
          searchParameters,
          undefined,
        ]);
      });

      it('calls algoliasearchHelper(client, indexName, searchParameters)', () => {
        expect(helperStub.calledOnce).toBe(
          true,
          'algoliasearchHelper called once'
        );
        expect(helperStub.args[0]).toEqual([
          client,
          indexName,
          {
            some: 'modified',
            values: [-2, -1],
            index: indexName,
            another: { different: 'parameter', config: 'parameter' },
          },
        ]);
      });

      it('calls helper.search()', () => {
        expect(helperSearchSpy.calledOnce).toBe(true);
      });

      it('calls widget.init(helper.state, helper, templatesConfig)', () => {
        expect(widget.init.calledOnce).toBe(true, 'widget.init called once');
        expect(widget.init.calledAfter(widget.getConfiguration)).toBe(
          true,
          'widget.init() was called after widget.getConfiguration()'
        );
        const args = widget.init.args[0][0];
        expect(args.state).toBe(helper.state);
        expect(args.helper).toBe(helper);
        expect(args.templatesConfig).toBe(search.templatesConfig);
        expect(args.onHistoryChange).toBe(search._onHistoryChange);
      });

      it('calls urlSync.getConfiguration after every widget', () => {
        expect(urlSync.getConfiguration.calledOnce).toBe(
          true,
          'urlSync.getConfiguration called once'
        );
        expect(
          urlSync.getConfiguration.calledAfter(widget.getConfiguration)
        ).toBe(true, 'urlSync.getConfiguration was called after widget.init');
      });

      it('does not call widget.render', () => {
        expect(widget.render.notCalled).toBe(true);
      });

      describe('when we have results', () => {
        let results;

        beforeEach(() => {
          results = { some: 'data' };
          helper.emit('result', results, helper.state);
        });

        it('calls widget.render({results, state, helper, templatesConfig, instantSearchInstance})', () => {
          expect(widget.render.calledOnce).toBe(
            true,
            'widget.render called once'
          );
          expect(widget.render.args[0]).toMatchSnapshot();
        });
      });
    });
  });

  describe('when we have 5 widgets (at once)', () => {
    let widgets;

    beforeEach(() => {
      widgets = range(5).map((widget, widgetIndex) => ({
        init() {},
        getConfiguration: sinon.stub().returns({ values: [widgetIndex] }),
      }));
      search.addWidgets(widgets);
      search.start();
    });

    it('calls widget[x].getConfiguration in the orders the widgets were added', () => {
      const order = widgets.every((widget, widgetIndex, filteredWidgets) => {
        if (widgetIndex === 0) {
          return (
            widget.getConfiguration.calledOnce &&
            widget.getConfiguration.calledBefore(
              filteredWidgets[1].getConfiguration
            )
          );
        }
        const previousWidget = filteredWidgets[widgetIndex - 1];
        return (
          widget.getConfiguration.calledOnce &&
          widget.getConfiguration.calledAfter(previousWidget.getConfiguration)
        );
      });

      expect(order).toBe(true);
    });

    it('recursively merges searchParameters.values array', () => {
      expect(helperStub.args[0][2].values).toEqual([-2, -1, 0, 1, 2, 3, 4]);
    });
  });

  describe('when render happens', () => {
    const render = sinon.spy();
    beforeEach(() => {
      render.resetHistory();
      const widgets = range(5).map(() => ({ render }));

      widgets.forEach(search.addWidget, search);

      search.start();
    });

    it('has a createURL method', () => {
      search.createURL({ hitsPerPage: 542 });
      expect(urlSync.createURL.calledOnce).toBe(true);
      expect(urlSync.createURL.getCall(0).args[0].hitsPerPage).toBe(542);
    });

    it('emits render when all render are done (using on)', () => {
      const onRender = sinon.spy();
      search.on('render', onRender);

      expect(render.callCount).toEqual(0);
      expect(onRender.callCount).toEqual(0);

      helper.emit('result', {}, helper.state);

      expect(render.callCount).toEqual(5);
      expect(onRender.callCount).toEqual(1);
      expect(render.calledBefore(onRender)).toBe(true);

      helper.emit('result', {}, helper.state);

      expect(render.callCount).toEqual(10);
      expect(onRender.callCount).toEqual(2);
    });

    it('emits render when all render are done (using once)', () => {
      const onRender = sinon.spy();
      search.once('render', onRender);

      expect(render.callCount).toEqual(0);
      expect(onRender.callCount).toEqual(0);

      helper.emit('result', {}, helper.state);

      expect(render.callCount).toEqual(5);
      expect(onRender.callCount).toEqual(1);
      expect(render.calledBefore(onRender)).toBe(true);

      helper.emit('result', {}, helper.state);

      expect(render.callCount).toEqual(10);
      expect(onRender.callCount).toEqual(1);
    });
  });

  describe('When removing a widget', () => {
    function registerWidget(
      widgetGetConfiguration = {
        facets: ['categories'],
        maxValuesPerFacet: 10,
      },
      dispose = jest.fn()
    ) {
      const widget = {
        getConfiguration: jest.fn(() => widgetGetConfiguration),
        init: jest.fn(),
        render: jest.fn(),
        dispose,
      };

      search.addWidget(widget);

      return widget;
    }

    beforeEach(() => {
      search = new InstantSearch({
        appId,
        apiKey,
        indexName,
      });
    });

    it('should unmount a widget without configuration', () => {
      const widget1 = registerWidget({});
      const widget2 = registerWidget({});

      expect(search.widgets).toHaveLength(2);

      search.start();
      search.removeWidget(widget1);
      search.removeWidget(widget2);

      expect(search.widgets).toHaveLength(0);
    });

    it('should unmount a widget with facets configuration', () => {
      const widget1 = registerWidget({ facets: ['price'] }, ({ state }) =>
        state.removeFacet('price')
      );
      search.start();

      expect(search.widgets).toHaveLength(1);
      expect(search.searchParameters.facets).toEqual(['price']);

      search.removeWidget(widget1);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.facets).toEqual([]);
    });

    it('should unmount a widget with hierarchicalFacets configuration', () => {
      const widget1 = registerWidget(
        {
          hierarchicalFacets: [
            {
              name: 'price',
              attributes: ['foo'],
              separator: ' > ',
              rootPath: 'lvl1',
              showParentLevel: true,
            },
          ],
        },
        ({ state }) => state.removeHierarchicalFacet('price')
      );
      search.start();

      expect(search.widgets).toHaveLength(1);
      expect(search.searchParameters.hierarchicalFacets).toEqual([
        {
          name: 'price',
          attributes: ['foo'],
          separator: ' > ',
          rootPath: 'lvl1',
          showParentLevel: true,
        },
      ]);

      search.removeWidget(widget1);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.hierarchicalFacets).toEqual([]);
    });

    it('should unmount a widget with disjunctiveFacets configuration', () => {
      const widget1 = registerWidget(
        { disjunctiveFacets: ['price'] },
        ({ state }) => state.removeDisjunctiveFacet('price')
      );
      search.start();

      expect(search.widgets).toHaveLength(1);
      expect(search.searchParameters.disjunctiveFacets).toEqual(['price']);

      search.removeWidget(widget1);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.disjunctiveFacets).toEqual([]);
    });

    it('should unmount a widget with numericRefinements configuration', () => {
      const widget1 = registerWidget(
        { numericRefinements: { price: {} } },
        ({ state }) => state.removeNumericRefinement('price')
      );
      search.start();

      expect(search.widgets).toHaveLength(1);
      expect(search.searchParameters.numericRefinements).toEqual({ price: {} });

      search.removeWidget(widget1);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.numericRefinements).toEqual({});
    });

    it('should unmount a widget with maxValuesPerFacet configuration', () => {
      const widget1 = registerWidget(undefined, ({ state }) =>
        state
          .removeFacet('categories')
          .setQueryParameters('maxValuesPerFacet', undefined)
      );
      search.start();

      expect(search.widgets).toHaveLength(1);
      expect(search.searchParameters.facets).toEqual(['categories']);
      expect(search.searchParameters.maxValuesPerFacet).toEqual(10);

      search.removeWidget(widget1);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.facets).toEqual([]);
      expect(search.searchParameters.maxValuesPerFacet).toBe(undefined);
    });

    it('should unmount multiple widgets at once', () => {
      const widget1 = registerWidget(
        { numericRefinements: { price: {} } },
        ({ state }) => state.removeNumericRefinement('price')
      );
      const widget2 = registerWidget(
        { disjunctiveFacets: ['price'] },
        ({ state }) => state.removeDisjunctiveFacet('price')
      );

      search.start();

      expect(search.widgets).toHaveLength(2);
      expect(search.searchParameters.numericRefinements).toEqual({ price: {} });
      expect(search.searchParameters.disjunctiveFacets).toEqual(['price']);

      search.removeWidgets([widget1, widget2]);

      expect(search.widgets).toHaveLength(0);
      expect(search.searchParameters.numericRefinements).toEqual({});
      expect(search.searchParameters.disjunctiveFacets).toEqual([]);
    });

    it('should unmount a widget without calling URLSync widget getConfiguration', () => {
      // fake url-sync widget
      const spy = jest.fn();

      class URLSync {
        constructor() {
          this.getConfiguration = spy;
          this.init = jest.fn();
          this.render = jest.fn();
          this.dispose = jest.fn();
        }
      }

      const urlSyncWidget = new URLSync();
      expect(urlSyncWidget.constructor.name).toEqual('URLSync');

      search.addWidget(urlSyncWidget);

      // add fake widget to dispose
      // that returns a `nextState` while dispose
      const widget1 = registerWidget(
        undefined,
        jest.fn(({ state: nextState }) => nextState)
      );

      const widget2 = registerWidget();
      search.start();

      // remove widget1
      search.removeWidget(widget1);

      // it should have been called only once after start();
      expect(spy).toHaveBeenCalledTimes(1);

      // but widget2 getConfiguration() should have been called twice
      expect(widget2.getConfiguration).toHaveBeenCalledTimes(2);
    });
  });

  describe('When adding widgets after start', () => {
    function registerWidget(
      widgetGetConfiguration = {},
      dispose = sinon.spy()
    ) {
      const widget = {
        getConfiguration: sinon.stub().returns(widgetGetConfiguration),
        init: sinon.spy(),
        render: sinon.spy(),
        dispose,
      };

      return widget;
    }

    beforeEach(() => {
      search = new InstantSearch({
        appId,
        apiKey,
        indexName,
      });
    });

    it('should add widgets after start', () => {
      search.start();
      expect(helperSearchSpy.callCount).toBe(1);

      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);

      const widget1 = registerWidget({ facets: ['price'] });
      search.addWidget(widget1);

      expect(helperSearchSpy.callCount).toBe(2);
      expect(widget1.init.calledOnce).toBe(true);

      const widget2 = registerWidget({ disjunctiveFacets: ['categories'] });
      search.addWidget(widget2);

      expect(widget2.init.calledOnce).toBe(true);
      expect(helperSearchSpy.callCount).toBe(3);

      expect(search.widgets).toHaveLength(2);
      expect(search.searchParameters.facets).toEqual(['price']);
      expect(search.searchParameters.disjunctiveFacets).toEqual(['categories']);
    });

    it('should trigger only one search using `addWidgets()`', () => {
      search.start();

      expect(helperSearchSpy.callCount).toBe(1);
      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);

      const widget1 = registerWidget({ facets: ['price'] });
      const widget2 = registerWidget({ disjunctiveFacets: ['categories'] });

      search.addWidgets([widget1, widget2]);

      expect(helperSearchSpy.callCount).toBe(2);
      expect(search.searchParameters.facets).toEqual(['price']);
      expect(search.searchParameters.disjunctiveFacets).toEqual(['categories']);
    });
  });

  it('should remove all widgets without triggering a search on dispose', () => {
    search = new InstantSearch({
      appId,
      apiKey,
      indexName,
    });

    const widgets = times(5, () => ({
      getConfiguration: () => ({}),
      init: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    }));

    search.addWidgets(widgets);
    search.start();

    expect(search.widgets).toHaveLength(5);
    expect(helperSearchSpy.callCount).toBe(1);

    search.dispose();

    expect(search.widgets).toHaveLength(0);
    expect(helperSearchSpy.callCount).toBe(1);
  });
});
