'use strict';

var algoliasearchHelper = require('../../../../');

function makeFakeClient() {
  return {
    search: vi.fn(function () {
      return new Promise(function () {});
    }),
    searchForFacetValues: vi.fn(function () {
      return new Promise(function () {});
    }),
    getRecommendations: vi.fn(function () {
      return new Promise(function () {});
    }),
  };
}

test('[derived helper] emit a search event', function () {
  var searched = vi.fn();
  var client = makeFakeClient();
  var helper = algoliasearchHelper(client, 'index');
  var derivedHelper = helper.derive(function (s) {
    return s;
  });

  derivedHelper.on('search', searched);

  expect(searched).toHaveBeenCalledTimes(0);

  helper.search();

  expect(searched).toHaveBeenCalledTimes(1);
  expect(searched).toHaveBeenLastCalledWith({
    state: helper.state,
    results: null,
  });
});

test('[derived helper] emit a fetch event', function () {
  var fetched = vi.fn();
  var client = makeFakeClient();
  var helper = algoliasearchHelper(client, 'index');
  var derivedHelper = helper.derive(
    function (s) {
      return s;
    },
    function (r) {
      return r;
    }
  );

  derivedHelper.on('fetch', fetched);

  expect(fetched).toHaveBeenCalledTimes(0);

  helper.recommend();

  expect(fetched).toHaveBeenCalledTimes(1);
  expect(fetched).toHaveBeenLastCalledWith({
    recommend: {
      state: helper.recommendState,
      results: null,
    },
  });
});
