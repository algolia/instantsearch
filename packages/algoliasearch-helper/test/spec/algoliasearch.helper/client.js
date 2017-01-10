'use strict';

var test = require('tape');
var sinon = require('sinon');
var algoliaSearchHelper = require('../../../index.js');

function makeFakeClient() {
  return {
    addAlgoliaAgent: function() {},
    search: sinon.spy()
  };
}

test('getClient / setClient', function(t) {
  var client0 = makeFakeClient();
  var helper = algoliaSearchHelper(client0, 'IndexName', {});

  t.equal(client0.search.callCount, 0, 'before any search the client should not have been called');
  helper.search();
  t.equal(client0.search.callCount, 1, 'after a single search, the client must have been strictly one time');

  t.equal(helper.getClient(), client0, 'getClient should return the instance defined with the Helper factory');

  var client1 = makeFakeClient();
  helper.setClient(client1);

  t.equal(helper.getClient(), client1);

  t.equal(client1.search.callCount, 0, 'the new client should not have been called before any search');
  helper.search();
  t.equal(client1.search.callCount, 1, 'the new client should have been called');
  t.equal(client0.search.callCount, 1, 'the old client should not have been called if it is not set anymore');

  t.end();
});
