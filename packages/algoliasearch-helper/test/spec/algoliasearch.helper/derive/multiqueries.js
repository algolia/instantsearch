'use strict';

var algoliasearchHelper = require('../../../../');

function makeFakeClient({
  searchAssertions = () => {},
  recommendAssertions = () => {},
}) {
  return {
    search: function () {
      searchAssertions.apply(null, arguments);

      return new Promise(function () {});
    },
    getRecommendations: function () {
      recommendAssertions.apply(null, arguments);

      return new Promise(function () {});
    },
  };
}

describe('search', function () {
  test('trigger a search without derivation', function () {
    var client = makeFakeClient({ searchAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.search();

    function searchAssertions(requests) {
      expect(requests.length).toBe(1);
    }
  });

  test('trigger a search with one derivation without a state change', function () {
    var client = makeFakeClient({ searchAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state;
    });

    helper.search();

    function searchAssertions(requests) {
      expect(requests.length).toBe(2);
      expect(requests[0]).toEqual(requests[1]);
    }
  });

  test('trigger a search with one derivation with a state change', function () {
    var client = makeFakeClient({ searchAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state.setQuery('otherQuery');
    });

    helper.search();

    function searchAssertions(requests) {
      expect(requests.length).toBe(2);
      expect(requests[0].params.query).toBeUndefined();
      expect(requests[1].params.query).toBe('otherQuery');

      delete requests[0].params.query;
      delete requests[1].params.query;

      expect(requests[0]).toEqual(requests[1]);
    }
  });

  test('trigger a search with derivation only', function () {
    var client = makeFakeClient({ searchAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.derive(function (state) {
      return state;
    });

    helper.searchOnlyWithDerivedHelpers();

    function searchAssertions(requests) {
      expect(requests.length).toBe(1);
    }
  });
});

describe('recommend', function () {
  test('trigger a recommend request without derivation', function () {
    var client = makeFakeClient({ recommendAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.addFrequentlyBoughtTogether({ $$id: '1', objectID: 'objectID' });
    helper.recommend();

    function recommendAssertions(requests) {
      expect(requests).toHaveLength(1);
    }
  });

  test('trigger a recommend request with one derivation', function () {
    var client = makeFakeClient({ recommendAssertions });
    var helper = algoliasearchHelper(client, 'indexName');

    helper.addFrequentlyBoughtTogether({ $$id: '1', objectID: 'objectID' });

    helper.derive(
      function (state) {
        return state;
      },
      function (recommendState) {
        return recommendState.addFrequentlyBoughtTogether({
          $$id: '2',
          objectID: 'objectID2',
        });
      }
    );

    helper.recommend();

    function recommendAssertions(requests) {
      expect(requests.length).toBe(2);
    }
  });
});
