var test = require('tape');
var _ = require('lodash');

test('InstantSearch: lifecycle', function(t) {
  var EventEmitter = require('events').EventEmitter;

  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  // simple mocks
  var client = {algolia: 'client'};
  var helper = new EventEmitter();
  helper.search = sinon.spy();
  helper.state = 'state';

  // hijack `algoliasearch` and `algoliasearchHelper` modules
  var algoliasearch = sinon.stub().returns(client);
  var algoliasearchHelper = sinon.stub().returns(helper);

  var appId = 'appId';
  var apiKey = 'apiKey';
  var indexName = 'lifeycle';

  var searchParameters = {some: 'configuration', another: {config: 'parameter'}};

  var widget = {
    getConfiguration: sinon.stub().returns({some: 'modified', another: {different: 'parameter'}}),
    init: sinon.spy(),
    render: sinon.spy()
  };

  var InstantSearch = proxyquire('../../lib/InstantSearch', {
    algoliasearch: algoliasearch,
    'algoliasearch-helper': algoliasearchHelper
  });

  var search = new InstantSearch({
    appId: appId,
    apiKey: apiKey,
    indexName: indexName,
    searchParameters: searchParameters
  });

  // instantiates a client
  t.ok(algoliasearch.calledOnce, 'algoliasearch called');
  t.deepEqual(
    algoliasearch.args[0],
    [appId, apiKey],
    'algoliasearch(appId, apiKey)'
  );
  t.ok(algoliasearchHelper.notCalled, 'algoliasearchHelper not yet called');

  // adding a widget, should not call widget.getConfiguration(searchParameters)
  search.addWidget(widget);
  t.ok(
    widget.getConfiguration.notCalled,
    'widget.getConfiguration not called when adding the widget to the instant search'
  );

  search.start();
  t.ok(widget.getConfiguration.calledOnce, 'widget.getConfiguration called');
  t.deepEqual(
    widget.getConfiguration.args[0],
    [searchParameters],
    'widget.getConfiguration(current searchParameters)'
  );
  t.ok(algoliasearchHelper.calledOnce, 'algoliasearchHelper called');
  t.deepEqual(
    algoliasearchHelper.args[0], [
      client,
      indexName,
      {some: 'modified', another: {different: 'parameter', config: 'parameter'}}
    ],
    'algoliasearchHelper(merged searchParameters)'
  );
  t.ok(helper.search.calledOnce, 'helper.search called');

  // widget.init
  t.ok(widget.init.calledOnce, 'widget.init called');
  t.ok(
    widget.init.calledAfter(widget.getConfiguration),
    'widget.init called after widget.getConfiguration'
  );
  t.deepEqual(
    widget.init.args[0],
    [helper.state, helper],
    'widget.init(helper.state, helper)'
  );
  t.ok(widget.render.notCalled, 'widget.render not yet called');

  // helper result event
  var results = {some: 'data'};
  helper.emit('result', results, helper.state);
  t.ok(widget.render.calledOnce, 'widget.render called');
  t.deepEqual(
    widget.render.args[0],
    [{
      results: results,
      state: helper.state,
      helper: helper,
      templateHelpers: search.templateHelpers
    }],
    'widget.render(results, state, helper)'
  );

  t.end();
});

test('InstantSearch: lifecycle, the widget with __initLast set to true should be called last.', function(t) {
  var EventEmitter = require('events').EventEmitter;

  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  // simple mocks
  var client = {algolia: 'client'};
  var helper = new EventEmitter();
  helper.search = sinon.spy();
  helper.state = 'state';

  // hijack `algoliasearch` and `algoliasearchHelper` modules
  var algoliasearch = sinon.stub().returns(client);
  var algoliasearchHelper = sinon.stub().returns(helper);

  var appId = 'appId';
  var apiKey = 'apiKey';
  var indexName = 'lifeycle';

  var searchParameters = {some: 'configuration', another: {config: 'parameter'}};

  var lastWidget;
  var nbConfiguredWidget = 0;
  var widgets = _(_.range(10)).map(function(i) {
    var widget = {
      getConfiguration: function() {
        nbConfiguredWidget++;
        t.ok(
          lastWidget.getConfiguration.notCalled,
          'The configuration of the last widget should not have been called yet'
        );
      },
      init: sinon.spy(),
      render: sinon.spy()
    };
    if (i === 5) {
      widget.__initLast = true;
      widget.getConfiguration = function() {
        widget.getConfiguration.notCalled = false;
        t.equals(nbConfiguredWidget, 9);
        t.end();
      };
      widget.getConfiguration.notCalled = true;
      lastWidget = widget;
    }
    return widget;
  });

  var InstantSearch = proxyquire('../../lib/InstantSearch', {
    algoliasearch: algoliasearch,
    'algoliasearch-helper': algoliasearchHelper
  });

  var search = new InstantSearch({
    appId: appId,
    apiKey: apiKey,
    indexName: indexName,
    searchParameters: searchParameters
  });

  widgets.forEach(function(w) {
    search.addWidget(w);
  }).value();

  search.start();
});
