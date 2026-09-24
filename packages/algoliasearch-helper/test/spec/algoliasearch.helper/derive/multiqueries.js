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
      return state.setIndex('anotherIndex');
    });

    helper.search();

    function searchAssertions(requests) {
      expect(requests.length).toBe(2);
      expect(requests[0].indexName).toBe('indexName');
      expect(requests[1].indexName).toBe('anotherIndex');
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

  test('trigger a search with derivation that deduplicates queries and fans out results', function (done) {
    var client = {
      search: function () {
        return Promise.resolve({
          results: [{ hits: [{ objectID: '1' }] }],
        });
      },
    };
    var helper = algoliasearchHelper(client, 'indexName');

    var derivedHelper = helper.derive(function (state) {
      return state;
    });

    var mainHelperCalled = false;
    var derivedHelperCalled = false;

    helper.on('result', function (results) {
      expect(results.results.hits).toEqual([{ objectID: '1' }]);
      mainHelperCalled = true;
      if (derivedHelperCalled) {
        done();
      }
    });

    derivedHelper.on('result', function (results) {
      expect(results.results.hits).toEqual([{ objectID: '1' }]);
      derivedHelperCalled = true;
      if (mainHelperCalled) {
        done();
      }
    });

    helper.search();
  });

  test('trigger a search with derivations that partially deduplicate and fan out correctly', function (done) {
    var client = {
      search: function (queries) {
        expect(queries).toHaveLength(2);
        return Promise.resolve({
          results: [
            { hits: [{ objectID: 'main' }] },
            { hits: [{ objectID: 'unique' }] },
          ],
        });
      },
    };
    var helper = algoliasearchHelper(client, 'indexName');

    // derived1 changes state (unique query)
    var derived1 = helper.derive(function (state) {
      return state.setQuery('unique query');
    });

    // derived2 does not change state (duplicate of main)
    var derived2 = helper.derive(function (state) {
      return state;
    });

    var mainCalled = false;
    var derived1Called = false;
    var derived2Called = false;

    function checkDone() {
      if (mainCalled && derived1Called && derived2Called) {
        done();
      }
    }

    helper.on('result', function (results) {
      expect(results.results.hits).toEqual([{ objectID: 'main' }]);
      mainCalled = true;
      checkDone();
    });

    derived1.on('result', function (results) {
      expect(results.results.hits).toEqual([{ objectID: 'unique' }]);
      derived1Called = true;
      checkDone();
    });

    derived2.on('result', function (results) {
      expect(results.results.hits).toEqual([{ objectID: 'main' }]);
      derived2Called = true;
      checkDone();
    });

    helper.search();
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
