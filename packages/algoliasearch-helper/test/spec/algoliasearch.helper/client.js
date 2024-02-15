'use strict';

var algoliasearch = require('algoliasearch');

var algoliaSearchHelper = require('../../../');
var version = require('../../../src/version');

function makeFakeClient() {
  var client = algoliasearch('what', 'wait', {});

  client.search = jest.fn(function () {
    return new Promise(function () {});
  });

  if (!client._ua) {
    Object.defineProperty(client, '_ua', {
      get() {
        return client.transporter.userAgent.value;
      },
    });
  }

  return client;
}

test("client without addAlgoliaAgent() doesn't throw on instantiation", function () {
  var client = {};

  expect(function () {
    algoliaSearchHelper(client);
  }).not.toThrow();
});

test('addAlgoliaAgent gets called if exists', function () {
  var client = {
    addAlgoliaAgent: jest.fn(),
  };

  expect(client.addAlgoliaAgent).not.toHaveBeenCalled();

  algoliaSearchHelper(client);

  expect(client.addAlgoliaAgent).toHaveBeenCalled();
});

test("client without clearCache() doesn't throw when clearing cache", function () {
  var client = {};
  var helper = algoliaSearchHelper(client);

  expect(function () {
    helper.clearCache();
  }).not.toThrow();
});

test('clearCache gets called if exists', function () {
  var client = {
    clearCache: jest.fn(),
  };
  var helper = algoliaSearchHelper(client);

  expect(client.clearCache).toHaveBeenCalledTimes(0);

  helper.clearCache();

  expect(client.clearCache).toHaveBeenCalledTimes(1);
});

test('setting the agent once', function () {
  var client = algoliasearch('what', 'wait', {});
  if (!client._ua) {
    Object.defineProperty(client, '_ua', {
      get() {
        return client.transporter.userAgent.value;
      },
    });
  }

  var originalUA = client._ua;
  algoliaSearchHelper(client, 'IndexName', {});
  algoliaSearchHelper(client, 'IndexName2', {});

  expect(client._ua).toBe(originalUA + '; JS Helper (' + version + ')');
});

test('getClient / setClient', function () {
  var client0 = makeFakeClient();
  var originalUA = client0._ua;
  var helper = algoliaSearchHelper(client0, 'IndexName', {});

  expect(client0.search).toHaveBeenCalledTimes(0);
  helper.search();
  expect(client0.search).toHaveBeenCalledTimes(1);

  expect(helper.getClient()).toBe(client0);

  expect(client0._ua).toBe(originalUA + '; JS Helper (' + version + ')');

  var client1 = makeFakeClient();
  helper.setClient(client1);

  expect(helper.getClient()).toBe(client1);

  expect(client1.search).toHaveBeenCalledTimes(0);
  helper.search();
  expect(client1.search).toHaveBeenCalledTimes(1);
  expect(client0.search).toHaveBeenCalledTimes(1);

  expect(client1._ua).toBe(originalUA + '; JS Helper (' + version + ')');

  helper.setClient(client1);
  expect(client1._ua).toBe(originalUA + '; JS Helper (' + version + ')');
});

test('initial client === getClient', function () {
  var client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  var helper = algoliaSearchHelper(client, 'instant_search', {});
  helper.setQuery('blah').search();
  expect(client).toBe(helper.getClient());
});
