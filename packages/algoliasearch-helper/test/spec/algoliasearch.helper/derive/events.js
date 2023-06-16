'use strict';

var algoliasearchHelper = require('../../../../');

function makeFakeClient() {
  return {
    search: jest.fn(function() {
      return new Promise(function() {});
    }),
    searchForFacetValues: jest.fn(function() {
      return new Promise(function() {});
    })
  };
}

test('[derived helper] emit a search event', function() {
  var searched = jest.fn();
  var client = makeFakeClient();
  var helper = algoliasearchHelper(client, 'index');
  var derivedHelper = helper.derive(function(s) {
    return s;
  });

  derivedHelper.on('search', searched);

  expect(searched).toHaveBeenCalledTimes(0);

  helper.search();

  expect(searched).toHaveBeenCalledTimes(1);
  expect(searched).toHaveBeenLastCalledWith({
    state: helper.state,
    results: null
  });
});
