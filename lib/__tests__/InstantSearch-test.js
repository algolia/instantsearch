/* eslint-env mocha */
import EventEmitter from 'events';

import expect from 'expect';
import range from 'lodash/utility/range';
import sinon from 'sinon';

import InstantSearch from '../InstantSearch';

describe('InstantSearch lifecycle', () => {
  var algoliasearch;
  var algoliasearchHelper;
  var client;
  var helper;
  var appId;
  var apiKey;
  var indexName;
  var searchParameters;
  var search;

  beforeEach(() => {
    client = {algolia: 'client'};
    helper = new EventEmitter();

    helper.search = sinon.spy();
    helper.state = 'state';

    algoliasearch = sinon.stub().returns(client);
    algoliasearchHelper = sinon.stub().returns(helper);

    appId = 'appId';
    apiKey = 'apiKey';
    indexName = 'lifeycle';

    searchParameters = {some: 'configuration', values: [-2, -1], another: {config: 'parameter'}};

    InstantSearch.__Rewire__('algoliasearch', algoliasearch);
    InstantSearch.__Rewire__('algoliasearchHelper', algoliasearchHelper);

    search = new InstantSearch({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchParameters: searchParameters
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

  context('when adding a widget', () => {
    var widget;

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
            {some: 'modified', values: [-2, -1], another: {different: 'parameter', config: 'parameter'}}
          ]);
      });

      it('calls helper.search()', () => {
        expect(helper.search.calledOnce).toBe(true);
      });

      it('calls widget.init(helper.state, helper, templatesConfig)', () => {
        expect(widget.init.calledOnce).toBe(true, 'widget.init called once');
        expect(widget.init.calledAfter(widget.getConfiguration))
          .toBe(true, 'widget.init() was called after widget.getConfiguration()');
        expect(widget.init.args[0]).toEqual([helper.state, helper, search.templatesConfig]);
      });

      it('does not call widget.render', () => {
        expect(widget.render.notCalled).toBe(true);
      });

      context('when we have results', () => {
        var results;

        beforeEach(() => {
          results = {some: 'data'};
          helper.emit('result', results, helper.state);
        });

        it('calls widget.render({results, state, helper, templatesConfig})', () => {
          expect(widget.render.calledOnce).toBe(true, 'widget.render called once');
          expect(widget.render.args[0])
            .toEqual([{
              createURL: search.createURL,
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
    var widgets;

    beforeEach(() => {
      widgets = range(5);
      widgets = widgets.map((widget, widgetIndex) => {
        widget = {
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

    it('recursevly merges searchParameters.values array', () => {
      expect(algoliasearchHelper.args[0][2].values).toEqual([-2, -1, 0, 1, 2, 3, 4]);
    });
  });

  context('when render happens', () => {
    var render = sinon.spy();
    beforeEach(() => {
      render.reset();
      var widgets = range(5).map(() => { return {render}; });

      widgets.forEach(search.addWidget, search);

      search.start();
    });

    it('emits render when all render are done (using on)', () => {
      var onRender = sinon.spy();
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
      var onRender = sinon.spy();
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
