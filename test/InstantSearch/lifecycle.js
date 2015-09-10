var test = require('tape');

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

  var search = new InstantSearch(appId, apiKey, indexName, searchParameters);

  // instantiates a client
  t.ok(algoliasearch.calledOnce, 'algoliasearch called');
  t.deepEqual(
    algoliasearch.args[0],
    [appId, apiKey],
    'algoliasearch(appId, apiKey)'
  );
  t.ok(algoliasearchHelper.notCalled, 'algoliasearchHelper not yet called');

  // adding a widget, should call widget.getConfiguration(searchParameters)
  search.addWidget(widget);
  t.ok(widget.getConfiguration.calledOnce, 'widget.getConfiguration called');
  t.deepEqual(
    widget.getConfiguration.args[0],
    [searchParameters],
    'widget.getConfiguration(current searchParameters)'
  );

  search.start();
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
    [results, helper.state, helper],
    'widget.render(results, state, helper)'
  );

  t.end();
});
