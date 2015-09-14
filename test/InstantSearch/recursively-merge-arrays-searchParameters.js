var test = require('tape');

test('InstantSearch: recursively merge arrays in searchParameters', function(t) {
  var EventEmitter = require('events').EventEmitter;

  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  // simple mocks
  var helper = new EventEmitter();
  helper.search = noop;

  // hijack `algoliasearch` and `algoliasearchHelper` modules
  var algoliasearch = noop;
  var algoliasearchHelper = sinon.stub().returns(helper);

  var searchParameters = {
    some: ['value', 'another value'],
    cool: 3,
    another: {nested: ['array', 'of', 'values']}
  };

  var firstWidget = {
    getConfiguration: sinon.stub().returns({
      first: ['values'],
      some: ['first'],
      another: {yes: true}
    })
  };

  var secondWidget = {
    getConfiguration: sinon.stub().returns({
      first: ['new value'],
      cool: 4,
      another: {nested: ['thing'], yes: false},
      some: ['second']
    })
  };

  var InstantSearch = proxyquire('../../lib/InstantSearch', {
    algoliasearch: algoliasearch,
    'algoliasearch-helper': algoliasearchHelper
  });

  var search = new InstantSearch({
    applicationID: 'appId',
    searchAPIKey: 'apiKey',
    indexName: 'recursively',
    defaultSearchParameters: searchParameters
  });

  search.addWidget(firstWidget);
  search.addWidget(secondWidget);
  search.start();

  var expected = {
    first: ['values', 'new value'],
    some: ['value', 'another value', 'first', 'second'],
    cool: 4,
    another: {nested: ['array', 'of', 'values', 'thing'], yes: false}
  };

  t.deepEqual(
    algoliasearchHelper.args[0][2],
    expected
  );

  t.end();
});

function noop() {}
