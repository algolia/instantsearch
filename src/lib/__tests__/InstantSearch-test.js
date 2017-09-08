import range from 'lodash/range';
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
    client = { algolia: 'client', addAlgoliaAgent: () => {} };
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
      algoliasearch.reset();

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
          expect(widget.render.args[0]).toEqual([
            {
              createURL: search._createAbsoluteURL,
              results,
              state: helper.state,
              helper,
              templatesConfig: search.templatesConfig,
              instantSearchInstance: search,
            },
          ]);
        });
      });
    });
  });

  describe('when we have 5 widgets', () => {
    let widgets;

    beforeEach(() => {
      widgets = range(5);
      widgets = widgets.map((widget, widgetIndex) => ({
        init() {},
        getConfiguration: sinon.stub().returns({ values: [widgetIndex] }),
      }));
      widgets.forEach(search.addWidget, search);
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
      render.reset();
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
});
