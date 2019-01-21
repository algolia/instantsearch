import range from 'lodash/range';
import times from 'lodash/times';
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

  beforeEach(() => {
    client = { search() {} };
    helper = algoliaSearchHelper(client);

    // when using searchFunction, we lose the reference to
    // the original helper.search
    const spy = jest.fn();

    helper.search = spy;
    helperSearchSpy = spy;

    algoliasearch = jest.fn().mockReturnValue(client);
    helperStub = jest.fn().mockReturnValue(helper);

    appId = 'appId';
    apiKey = 'apiKey';
    indexName = 'lifecycle';

    searchParameters = {
      some: 'configuration',
      values: [-2, -1],
      index: indexName,
      another: { config: 'parameter' },
    };

    InstantSearch.__Rewire__('algoliasearch', algoliasearch);
    InstantSearch.__Rewire__('algoliasearchHelper', helperStub);

    search = new InstantSearch({
      indexName,
      searchClient: algoliasearch(appId, apiKey),
      searchParameters,
    });
  });

  afterEach(() => {
    InstantSearch.__ResetDependency__('algoliasearch');
    InstantSearch.__ResetDependency__('algoliasearchHelper');
  });

  it('calls algoliasearch(appId, apiKey)', () => {
    expect(algoliasearch).toHaveBeenCalledTimes(1);
    expect(algoliasearch).toHaveBeenCalledWith(appId, apiKey);
  });

  it('does not call algoliasearchHelper', () => {
    expect(helperStub).not.toHaveBeenCalled();
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
      indexName,
      searchClient: algoliasearch(appId, apiKey),
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
        getConfiguration: jest.fn().mockReturnValue({
          some: 'modified',
          another: { different: 'parameter' },
        }),
        init: jest.fn(() => {
          helper.state.sendMeToUrlSync = true;
        }),
        render: jest.fn(),
      };
      search.addWidget(widget);
    });

    it('does not call widget.getConfiguration', () => {
      expect(widget.getConfiguration).not.toHaveBeenCalled();
    });

    describe('when we call search.start', () => {
      beforeEach(() => {
        search.start();
      });

      it('calls widget.getConfiguration(searchParameters)', () => {
        expect(widget.getConfiguration).toHaveBeenCalledWith(
          searchParameters,
          undefined
        );
      });

      it('calls algoliasearchHelper(client, indexName, searchParameters)', () => {
        expect(helperStub).toHaveBeenCalledTimes(1);
        expect(helperStub).toHaveBeenCalledWith(client, indexName, {
          some: 'modified',
          values: [-2, -1],
          index: indexName,
          another: { different: 'parameter', config: 'parameter' },
        });
      });

      it('calls helper.search()', () => {
        expect(helperSearchSpy).toHaveBeenCalledTimes(1);
      });

      it('calls widget.init(helper.state, helper, templatesConfig)', () => {
        expect(widget.getConfiguration).toHaveBeenCalledTimes(1);
        expect(widget.init).toHaveBeenCalledTimes(1);
        const args = widget.init.mock.calls[0][0];
        expect(args.state).toBe(helper.state);
        expect(args.helper).toBe(helper);
        expect(args.templatesConfig).toBe(search.templatesConfig);
        expect(args.onHistoryChange).toBe(search._onHistoryChange);
      });

      it('does not call widget.render', () => {
        expect(widget.render).not.toHaveBeenCalled();
      });

      describe('when we have results', () => {
        let results;

        beforeEach(() => {
          results = { some: 'data' };
          helper.emit('result', results, helper.state);
        });

        it('calls widget.render({results, state, helper, templatesConfig, instantSearchInstance})', () => {
          expect(widget.render).toHaveBeenCalledTimes(1);
          expect(widget.render.mock.calls[0]).toMatchSnapshot();
        });
      });
    });
  });

  describe('when we have 5 widgets (at once)', () => {
    let widgets;

    beforeEach(() => {
      widgets = range(5).map((widget, widgetIndex) => ({
        init() {},
        getConfiguration: jest.fn().mockReturnValue({ values: [widgetIndex] }),
      }));
      search.addWidgets(widgets);
      search.start();
    });

    it('recursively merges searchParameters.values array', () => {
      expect(helperStub.mock.calls[0][2].values).toEqual([
        -2,
        -1,
        0,
        1,
        2,
        3,
        4,
      ]);
    });
  });

  describe('when render happens', () => {
    const render = jest.fn();
    beforeEach(() => {
      render.mockReset();
      const widgets = range(5).map(() => ({ render }));

      widgets.forEach(search.addWidget, search);

      search.start();
    });

    it('emits render when all render are done (using on)', () => {
      const onRender = jest.fn();
      search.on('render', onRender);

      expect(render).toHaveBeenCalledTimes(0);
      expect(onRender).toHaveBeenCalledTimes(0);

      helper.emit('result', {}, helper.state);

      expect(render).toHaveBeenCalledTimes(5);
      expect(onRender).toHaveBeenCalledTimes(1);

      helper.emit('result', {}, helper.state);

      expect(render).toHaveBeenCalledTimes(10);
      expect(onRender).toHaveBeenCalledTimes(2);
    });

    it('emits render when all render are done (using once)', () => {
      const onRender = jest.fn();
      search.once('render', onRender);

      expect(render).toHaveBeenCalledTimes(0);
      expect(onRender).toHaveBeenCalledTimes(0);

      helper.emit('result', {}, helper.state);

      expect(render).toHaveBeenCalledTimes(5);
      expect(onRender).toHaveBeenCalledTimes(1);

      helper.emit('result', {}, helper.state);

      expect(render).toHaveBeenCalledTimes(10);
      expect(onRender).toHaveBeenCalledTimes(1);
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
        indexName,
        searchClient: algoliasearch(appId, apiKey),
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
  });

  describe('When adding widgets after start', () => {
    function registerWidget(widgetGetConfiguration = {}, dispose = jest.fn()) {
      const widget = {
        getConfiguration: jest.fn().mockReturnValue(widgetGetConfiguration),
        init: jest.fn(),
        render: jest.fn(),
        dispose,
      };

      return widget;
    }

    beforeEach(() => {
      search = new InstantSearch({
        indexName,
        searchClient: algoliasearch(appId, apiKey),
      });
    });

    it('should add widgets after start', () => {
      search.start();
      expect(helperSearchSpy).toHaveBeenCalledTimes(1);

      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);

      const widget1 = registerWidget({ facets: ['price'] });
      search.addWidget(widget1);

      expect(helperSearchSpy).toHaveBeenCalledTimes(2);
      expect(widget1.init).toHaveBeenCalledTimes(1);

      const widget2 = registerWidget({ disjunctiveFacets: ['categories'] });
      search.addWidget(widget2);

      expect(widget2.init).toHaveBeenCalledTimes(1);
      expect(helperSearchSpy).toHaveBeenCalledTimes(3);

      expect(search.widgets).toHaveLength(2);
      expect(search.searchParameters.facets).toEqual(['price']);
      expect(search.searchParameters.disjunctiveFacets).toEqual(['categories']);
    });

    it('should trigger only one search using `addWidgets()`', () => {
      search.start();

      expect(helperSearchSpy).toHaveBeenCalledTimes(1);
      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);

      const widget1 = registerWidget({ facets: ['price'] });
      const widget2 = registerWidget({ disjunctiveFacets: ['categories'] });

      search.addWidgets([widget1, widget2]);

      expect(helperSearchSpy).toHaveBeenCalledTimes(2);
      expect(search.searchParameters.facets).toEqual(['price']);
      expect(search.searchParameters.disjunctiveFacets).toEqual(['categories']);
    });

    it('should not trigger a search without widgets to add', () => {
      search.start();

      expect(helperSearchSpy).toHaveBeenCalledTimes(1);
      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);

      search.addWidgets([]);

      expect(helperSearchSpy).toHaveBeenCalledTimes(1);
      expect(search.widgets).toHaveLength(0);
      expect(search.started).toBe(true);
    });
  });

  it('should remove all widgets without triggering a search on dispose', () => {
    search = new InstantSearch({
      indexName,
      searchClient: algoliasearch(appId, apiKey),
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
    expect(helperSearchSpy).toHaveBeenCalledTimes(1);
    expect(search.started).toBe(true);

    search.dispose();

    expect(search.widgets).toHaveLength(0);
    expect(helperSearchSpy).toHaveBeenCalledTimes(1);
    expect(search.started).toBe(false);
  });
});

describe('dispose', () => {
  it('should set the helper to `null`', () => {
    const search = new InstantSearch({
      indexName: '',
      searchClient: {},
    });

    search.start();

    expect(search.helper).not.toBe(null);

    search.dispose();

    expect(search.helper).toBe(null);

    search.start();

    expect(search.helper).not.toBe(null);
  });
});

it('Allows to start without widgets', () => {
  const instance = new InstantSearch({
    searchClient: {
      search() {
        return Promise.resolve({
          results: [
            {
              query: 'fake query',
            },
          ],
        });
      },
    },
    indexName: 'bogus',
  });

  expect(() => instance.start()).not.toThrow();
});

it('Does not allow to start twice', () => {
  const instance = new InstantSearch({
    searchClient: {
      search() {
        return Promise.resolve({
          results: [
            {
              query: 'fake query',
            },
          ],
        });
      },
    },
    indexName: 'bogus',
  });

  expect(() => instance.start()).not.toThrow();
  expect(() => {
    instance.start();
  }).toThrowErrorMatchingInlineSnapshot(
    `"start() has been already called once"`
  );
});
