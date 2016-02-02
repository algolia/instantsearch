/* eslint-env mocha */
import EventEmitter from 'events';

import expect from 'expect';
import range from 'lodash/utility/range';
import sinon from 'sinon';
import jsdom from 'jsdom-global';

import SearchParameters from 'algoliasearch-helper/src/SearchParameters';
import InstantSearch from '../InstantSearch';

describe('InstantSearch lifecycle', () => {
  beforeEach(function() {this.jsdom = jsdom();});
  afterEach(function() {this.jsdom();});

  let algoliasearch;
  let algoliasearchHelper;
  let client;
  let helper;
  let appId;
  let apiKey;
  let indexName;
  let searchParameters;
  let search;

  beforeEach(() => {
    client = {algolia: 'client', addAlgoliaAgent: () => {}};
    helper = new EventEmitter();

    helper.search = sinon.spy();
    helper.getState = sinon.stub().returns({});
    helper.state = {
      setQueryParameters: function(params) { return new SearchParameters(params); }
    };

    algoliasearch = sinon.stub().returns(client);
    algoliasearchHelper = sinon.stub().returns(helper);

    appId = 'appId';
    apiKey = 'apiKey';
    indexName = 'lifecycle';

    searchParameters = {
      some: 'configuration',
      values: [-2, -1],
      index: indexName,
      another: {config: 'parameter'}
    };

    InstantSearch.__Rewire__('algoliasearch', algoliasearch);
    InstantSearch.__Rewire__('algoliasearchHelper', algoliasearchHelper);

    search = new InstantSearch({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchParameters: searchParameters,
      urlSync: {}
    });
  });

  afterEach(() => {
    InstantSearch.__ResetDependency__('algoliasearch');
    InstantSearch.__ResetDependency__('algoliasearchHelper');
  });

  it('calls algoliasearch(appId, apiKey)', () => {
    expect(algoliasearch.calledOnce).toBe(true, 'algoliasearch called once');
    expect(algoliasearch.args[0])
      .toEqual([appId, apiKey]);
  });

  it('does not call algoliasearchHelper', () => {
    expect(algoliasearchHelper.notCalled).toBe(true, 'algoliasearchHelper not yet called');
  });

  context('when adding a widget without render and init', () => {
    let widget;

    beforeEach(() => {
      widget = {};
    });

    it('throw an error', function() {
      expect(() => {
        search.addWidget(widget);
      }).toThrow('Widget definition missing render or init method');
    });
  });

  context('when adding a widget', () => {
    let widget;

    beforeEach(() => {
      widget = {
        getConfiguration: sinon.stub().returns({some: 'modified', another: {different: 'parameter'}}),
        init: sinon.spy(),
        render: sinon.spy()
      };
      search.addWidget(widget);
    });

    it('does not call widget.getConfiguration', () => {
      expect(widget.getConfiguration.notCalled).toBe(true);
    });

    context('when we call search.start', () => {
      beforeEach(() => {
        search.start();
      });

      it('calls widget.getConfiguration(searchParameters)', () => {
        expect(widget.getConfiguration.args[0]).toEqual([searchParameters]);
      });

      it('calls algoliasearchHelper(client, indexName, searchParameters)', () => {
        expect(algoliasearchHelper.calledOnce).toBe(true, 'algoliasearchHelper called once');
        expect(algoliasearchHelper.args[0])
          .toEqual([
            client,
            indexName,
            {
              some: 'modified',
              values: [-2, -1],
              index: indexName,
              another: {different: 'parameter', config: 'parameter'}
            }
          ]);
      });

      it('calls helper.search()', () => {
        expect(helper.search.calledOnce).toBe(true);
      });

      it('calls widget.init(helper.state, helper, templatesConfig)', () => {
        expect(widget.init.calledOnce).toBe(true, 'widget.init called once');
        expect(widget.init.calledAfter(widget.getConfiguration))
          .toBe(true, 'widget.init() was called after widget.getConfiguration()');
        const args = widget.init.args[0][0];
        expect(args.state).toBe(helper.state);
        expect(args.helper).toBe(helper);
        expect(args.templatesConfig).toBe(search.templatesConfig);
        expect(args.onHistoryChange).toBe(search._onHistoryChange);
      });

      it('does not call widget.render', () => {
        expect(widget.render.notCalled).toBe(true);
      });

      context('when we have results', () => {
        let results;

        beforeEach(() => {
          results = {some: 'data'};
          helper.emit('result', results, helper.state);
        });

        it('calls widget.render({results, state, helper, templatesConfig})', () => {
          expect(widget.render.calledOnce).toBe(true, 'widget.render called once');
          expect(widget.render.args[0])
            .toEqual([{
              createURL: search._createURL,
              results,
              state: helper.state,
              helper,
              templatesConfig: search.templatesConfig
            }]);
        });
      });
    });
  });

  context('when we have 5 widgets', () => {
    let widgets;

    beforeEach(() => {
      widgets = range(5);
      widgets = widgets.map((widget, widgetIndex) => {
        widget = {
          init: function() {},
          getConfiguration: sinon.stub().returns({values: [widgetIndex]})
        };

        return widget;
      });
      widgets.forEach(search.addWidget, search);
      search.start();
    });

    it('calls widget[x].getConfiguration in the orders the widgets were added', () => {
      let order = widgets
        .every((widget, widgetIndex, filteredWidgets) => {
          if (widgetIndex === 0) {
            return widget.getConfiguration.calledOnce &&
              widget.getConfiguration.calledBefore(filteredWidgets[1].getConfiguration);
          }
          let previousWidget = filteredWidgets[widgetIndex - 1];
          return widget.getConfiguration.calledOnce &&
            widget.getConfiguration.calledAfter(previousWidget.getConfiguration);
        });

      expect(order).toBe(true);
    });

    it('recursively merges searchParameters.values array', () => {
      expect(algoliasearchHelper.args[0][2].values).toEqual([-2, -1, 0, 1, 2, 3, 4]);
    });
  });

  context('when render happens', () => {
    let render = sinon.spy();
    beforeEach(() => {
      render.reset();
      let widgets = range(5).map(() => { return {render}; });

      widgets.forEach(search.addWidget, search);

      search.start();
    });

    it('creates a URL', () => {
      expect(search.createURL({hitsPerPage: 42})).toEqual('?q=&hPP=42&idx=&p=0');
    });

    it('emits render when all render are done (using on)', () => {
      let onRender = sinon.spy();
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
      let onRender = sinon.spy();
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
