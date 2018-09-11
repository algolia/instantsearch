'use strict';

var test = require('tape');
var sinon = require('sinon');
var algoliaSearchHelper = require('../../../index.js');
var version = require('../../../src/version');
var algoliasearch = require('algoliasearch');

function makeFakeClient() {
  var client = algoliasearch('what', 'wait', {});
  client.search = sinon.stub().returns(new Promise(function() {}));
  return client;
}

test("client without addAlgoliaAgent() doesn't throw on instanciation", function(t) {
  var client = {};

  t.doesNotThrow(function() {
    algoliaSearchHelper(client);
  });

  t.end();
});

test('addAlgoliaAgent gets called if exists', function(t) {
  var client = {
    addAlgoliaAgent: sinon.stub()
  };

  t.notOk(client.addAlgoliaAgent.called);

  algoliaSearchHelper(client);

  t.ok(client.addAlgoliaAgent.called);

  t.end();
});

test("client without clearCache() doesn't throw when clearing cache", function(t) {
  var client = {};
  var helper = algoliaSearchHelper(client);

  t.doesNotThrow(function() {
    helper.clearCache();
  });

  t.end();
});

test('clearCache gets called if exists', function(t) {
  var client = {
    clearCache: sinon.stub()
  };
  var helper = algoliaSearchHelper(client);

  t.notOk(client.clearCache.called);

  helper.clearCache();

  t.ok(client.clearCache.called);

  t.end();
});

test('setting the agent once', function(t) {
  var client = algoliasearch('what', 'wait', {});
  var originalUA = client._ua;
  algoliaSearchHelper(client, 'IndexName', {});
  algoliaSearchHelper(client, 'IndexName2', {});

  t.equal(client._ua, originalUA + ';JS Helper ' + version);

  t.end();
});

test('getClient / setClient', function(t) {
  var client0 = makeFakeClient();
  var originalUA = client0._ua;
  var helper = algoliaSearchHelper(client0, 'IndexName', {});

  t.equal(client0.search.callCount, 0, 'before any search the client should not have been called');
  helper.search();
  t.equal(client0.search.callCount, 1, 'after a single search, the client must have been strictly one time');

  t.equal(helper.getClient(), client0, 'getClient should return the instance defined with the Helper factory');

  t.equal(client0._ua, originalUA + ';JS Helper ' + version, 'sets the helper agent, client 0');

  var client1 = makeFakeClient();
  helper.setClient(client1);

  t.equal(helper.getClient(), client1);

  t.equal(client1.search.callCount, 0, 'the new client should not have been called before any search');
  helper.search();
  t.equal(client1.search.callCount, 1, 'the new client should have been called');
  t.equal(client0.search.callCount, 1, 'the old client should not have been called if it is not set anymore');

  t.equal(client1._ua, originalUA + ';JS Helper ' + version, 'sets the helper agent, client 1');

  helper.setClient(client1);
  t.equal(client1._ua, originalUA + ';JS Helper ' + version, 'does not set the helper agent twice, client 1');

  t.end();
});

test('initial client === getClient', function(t) {
  t.plan(1);
  var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  var helper = algoliaSearchHelper(client, 'instant_search', {});
  helper.setQuery('blah').search();
  t.equal(client, helper.getClient());
});
