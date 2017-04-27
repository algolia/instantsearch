'use strict';

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _SearchParameters = require('algoliasearch-helper/src/SearchParameters');

var _SearchParameters2 = _interopRequireDefault(_SearchParameters);

var _InstantSearch = require('../InstantSearch');

var _InstantSearch2 = _interopRequireDefault(_InstantSearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */
describe('InstantSearch lifecycle', function () {
  var algoliasearch = void 0;
  var algoliasearchHelper = void 0;
  var client = void 0;
  var helper = void 0;
  var appId = void 0;
  var apiKey = void 0;
  var indexName = void 0;
  var searchParameters = void 0;
  var search = void 0;
  var helperSearchSpy = void 0;
  var urlSync = void 0;

  beforeEach(function () {
    client = { algolia: 'client', addAlgoliaAgent: function addAlgoliaAgent() {} };
    helper = new _events2.default();

    // when using searchFunction, we lose the reference to
    // the original helper.search
    helperSearchSpy = _sinon2.default.spy();
    helper.search = helperSearchSpy;
    helper.getState = _sinon2.default.stub().returns({});
    helper.setState = _sinon2.default.spy();
    helper.state = {
      setQueryParameters: function setQueryParameters(params) {
        return new _SearchParameters2.default(params);
      }
    };

    urlSync = {
      createURL: _sinon2.default.spy(),
      onHistoryChange: function onHistoryChange() {},
      getConfiguration: _sinon2.default.spy(),
      render: function render() {}
    };

    algoliasearch = _sinon2.default.stub().returns(client);
    algoliasearchHelper = _sinon2.default.stub().returns(helper);

    appId = 'appId';
    apiKey = 'apiKey';
    indexName = 'lifecycle';

    searchParameters = {
      some: 'configuration',
      values: [-2, -1],
      index: indexName,
      another: { config: 'parameter' }
    };

    _InstantSearch2.default.__Rewire__('urlSyncWidget', function () {
      return urlSync;
    });
    _InstantSearch2.default.__Rewire__('algoliasearch', algoliasearch);
    _InstantSearch2.default.__Rewire__('algoliasearchHelper', algoliasearchHelper);

    search = new _InstantSearch2.default({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchParameters: searchParameters,
      urlSync: {}
    });
  });

  afterEach(function () {
    _InstantSearch2.default.__ResetDependency__('urlSyncWidget');
    _InstantSearch2.default.__ResetDependency__('algoliasearch');
    _InstantSearch2.default.__ResetDependency__('algoliasearchHelper');
  });

  it('calls algoliasearch(appId, apiKey)', function () {
    (0, _expect2.default)(algoliasearch.calledOnce).toBe(true, 'algoliasearch called once');
    (0, _expect2.default)(algoliasearch.args[0]).toEqual([appId, apiKey]);
  });

  it('does not call algoliasearchHelper', function () {
    (0, _expect2.default)(algoliasearchHelper.notCalled).toBe(true, 'algoliasearchHelper not yet called');
  });

  context('when adding a widget without render and init', function () {
    var widget = void 0;

    beforeEach(function () {
      widget = {};
    });

    it('throw an error', function () {
      (0, _expect2.default)(function () {
        search.addWidget(widget);
      }).toThrow('Widget definition missing render or init method');
    });
  });

  it('calls the provided searchFunction when used', function () {
    var searchSpy = _sinon2.default.spy();
    search = new _InstantSearch2.default({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchFunction: searchSpy
    });
    search.start();
    (0, _expect2.default)(searchSpy.calledOnce).toBe(true);
    (0, _expect2.default)(helperSearchSpy.calledOnce).toBe(false);
  });

  it('does not fail when passing same references inside multiple searchParameters props', function () {
    var disjunctiveFacetsRefinements = { fruits: ['apple'] };
    var facetsRefinements = disjunctiveFacetsRefinements;
    search = new _InstantSearch2.default({
      appId: appId,
      apiKey: apiKey,
      indexName: indexName,
      searchParameters: {
        disjunctiveFacetsRefinements: disjunctiveFacetsRefinements,
        facetsRefinements: facetsRefinements
      }
    });
    search.addWidget({
      getConfiguration: function getConfiguration() {
        return { disjunctiveFacetsRefinements: { fruits: ['orange'] } };
      },
      init: function init() {}
    });
    search.start();
    (0, _expect2.default)(search.searchParameters.facetsRefinements).toEqual({ fruits: ['apple'] });
  });

  context('when adding a widget', function () {
    var widget = void 0;

    beforeEach(function () {
      widget = {
        getConfiguration: _sinon2.default.stub().returns({ some: 'modified', another: { different: 'parameter' } }),
        init: _sinon2.default.spy(function () {
          helper.state.sendMeToUrlSync = true;
        }),
        render: _sinon2.default.spy()
      };
      search.addWidget(widget);
    });

    it('does not call widget.getConfiguration', function () {
      (0, _expect2.default)(widget.getConfiguration.notCalled).toBe(true);
    });

    context('when we call search.start', function () {
      beforeEach(function () {
        search.start();
      });

      it('calls widget.getConfiguration(searchParameters)', function () {
        (0, _expect2.default)(widget.getConfiguration.args[0]).toEqual([searchParameters, undefined]);
      });

      it('calls algoliasearchHelper(client, indexName, searchParameters)', function () {
        (0, _expect2.default)(algoliasearchHelper.calledOnce).toBe(true, 'algoliasearchHelper called once');
        (0, _expect2.default)(algoliasearchHelper.args[0]).toEqual([client, indexName, {
          some: 'modified',
          values: [-2, -1],
          index: indexName,
          another: { different: 'parameter', config: 'parameter' }
        }]);
      });

      it('calls helper.search()', function () {
        (0, _expect2.default)(helperSearchSpy.calledOnce).toBe(true);
      });

      it('calls widget.init(helper.state, helper, templatesConfig)', function () {
        (0, _expect2.default)(widget.init.calledOnce).toBe(true, 'widget.init called once');
        (0, _expect2.default)(widget.init.calledAfter(widget.getConfiguration)).toBe(true, 'widget.init() was called after widget.getConfiguration()');
        var args = widget.init.args[0][0];
        (0, _expect2.default)(args.state).toBe(helper.state);
        (0, _expect2.default)(args.helper).toBe(helper);
        (0, _expect2.default)(args.templatesConfig).toBe(search.templatesConfig);
        (0, _expect2.default)(args.onHistoryChange).toBe(search._onHistoryChange);
      });

      it('calls urlSync.getConfiguration after every widget', function () {
        (0, _expect2.default)(urlSync.getConfiguration.calledOnce).toBe(true, 'urlSync.getConfiguration called once');
        (0, _expect2.default)(urlSync.getConfiguration.calledAfter(widget.getConfiguration)).toBe(true, 'urlSync.getConfiguration was called after widget.init');
      });

      it('does not call widget.render', function () {
        (0, _expect2.default)(widget.render.notCalled).toBe(true);
      });

      context('when we have results', function () {
        var results = void 0;

        beforeEach(function () {
          results = { some: 'data' };
          helper.emit('result', results, helper.state);
        });

        it('calls widget.render({results, state, helper, templatesConfig})', function () {
          (0, _expect2.default)(widget.render.calledOnce).toBe(true, 'widget.render called once');
          (0, _expect2.default)(widget.render.args[0]).toEqual([{
            createURL: search._createAbsoluteURL,
            results: results,
            state: helper.state,
            helper: helper,
            templatesConfig: search.templatesConfig
          }]);
        });
      });
    });
  });

  context('when we have 5 widgets', function () {
    var widgets = void 0;

    beforeEach(function () {
      widgets = (0, _range2.default)(5);
      widgets = widgets.map(function (widget, widgetIndex) {
        return {
          init: function init() {},

          getConfiguration: _sinon2.default.stub().returns({ values: [widgetIndex] })
        };
      });
      widgets.forEach(search.addWidget, search);
      search.start();
    });

    it('calls widget[x].getConfiguration in the orders the widgets were added', function () {
      var order = widgets.every(function (widget, widgetIndex, filteredWidgets) {
        if (widgetIndex === 0) {
          return widget.getConfiguration.calledOnce && widget.getConfiguration.calledBefore(filteredWidgets[1].getConfiguration);
        }
        var previousWidget = filteredWidgets[widgetIndex - 1];
        return widget.getConfiguration.calledOnce && widget.getConfiguration.calledAfter(previousWidget.getConfiguration);
      });

      (0, _expect2.default)(order).toBe(true);
    });

    it('recursively merges searchParameters.values array', function () {
      (0, _expect2.default)(algoliasearchHelper.args[0][2].values).toEqual([-2, -1, 0, 1, 2, 3, 4]);
    });
  });

  context('when render happens', function () {
    var render = _sinon2.default.spy();
    beforeEach(function () {
      render.reset();
      var widgets = (0, _range2.default)(5).map(function () {
        return { render: render };
      });

      widgets.forEach(search.addWidget, search);

      search.start();
    });

    it('has a createURL method', function () {
      search.createURL({ hitsPerPage: 542 });
      (0, _expect2.default)(urlSync.createURL.calledOnce).toBe(true);
      (0, _expect2.default)(urlSync.createURL.getCall(0).args[0].hitsPerPage).toBe(542);
    });

    it('emits render when all render are done (using on)', function () {
      var onRender = _sinon2.default.spy();
      search.on('render', onRender);

      (0, _expect2.default)(render.callCount).toEqual(0);
      (0, _expect2.default)(onRender.callCount).toEqual(0);

      helper.emit('result', {}, helper.state);

      (0, _expect2.default)(render.callCount).toEqual(5);
      (0, _expect2.default)(onRender.callCount).toEqual(1);
      (0, _expect2.default)(render.calledBefore(onRender)).toBe(true);

      helper.emit('result', {}, helper.state);

      (0, _expect2.default)(render.callCount).toEqual(10);
      (0, _expect2.default)(onRender.callCount).toEqual(2);
    });

    it('emits render when all render are done (using once)', function () {
      var onRender = _sinon2.default.spy();
      search.once('render', onRender);

      (0, _expect2.default)(render.callCount).toEqual(0);
      (0, _expect2.default)(onRender.callCount).toEqual(0);

      helper.emit('result', {}, helper.state);

      (0, _expect2.default)(render.callCount).toEqual(5);
      (0, _expect2.default)(onRender.callCount).toEqual(1);
      (0, _expect2.default)(render.calledBefore(onRender)).toBe(true);

      helper.emit('result', {}, helper.state);

      (0, _expect2.default)(render.callCount).toEqual(10);
      (0, _expect2.default)(onRender.callCount).toEqual(1);
    });
  });
});