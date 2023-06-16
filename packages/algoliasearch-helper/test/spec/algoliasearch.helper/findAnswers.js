'use strict';

var algoliasearchHelper = require('../../../index');

function makeFakeFindAnswersResponse() {
  return {
    exhaustiveFacetsCount: true,
    facetHits: [],
    processingTimeMS: 3,
  };
}

function setupTestEnvironment(helperOptions) {
  var findAnswers = jest.fn(function () {
    return Promise.resolve([makeFakeFindAnswersResponse()]);
  });

  var fakeClient = {
    initIndex: function () {
      return {
        findAnswers: findAnswers,
      };
    },
  };

  var helper = algoliasearchHelper(fakeClient, 'index', helperOptions);

  return {
    findAnswers: findAnswers,
    helper: helper,
  };
}

test('returns an empty array with no derived helper', function () {
  var env = setupTestEnvironment();
  var helper = env.helper;
  var findAnswers = env.findAnswers;

  return helper
    .findAnswers({
      attributesForPrediction: ['description'],
      queryLanguages: ['en'],
      nbHits: 1,
    })
    .then(function (result) {
      expect(findAnswers).toHaveBeenCalledTimes(0);
      expect(result).toEqual([]);
    });
});

test('returns a correct result with one derivation', function () {
  var env = setupTestEnvironment();
  var helper = env.helper;
  var findAnswers = env.findAnswers;

  helper.derive(function (state) {
    return state;
  });

  return helper
    .findAnswers({
      attributesForPrediction: ['description'],
      queryLanguages: ['en'],
      nbHits: 1,
    })
    .then(function (result) {
      expect(findAnswers).toHaveBeenCalledTimes(1);
      expect(result).toEqual([makeFakeFindAnswersResponse()]);
    });
});

test('runs findAnswers with facets', function () {
  var env = setupTestEnvironment({ facets: ['facet1'] });
  var helper = env.helper;
  var findAnswers = env.findAnswers;
  helper.addFacetRefinement('facet1', 'facetValue');

  helper.derive(function (state) {
    return state;
  });

  helper.setQuery('hello');

  return helper
    .findAnswers({
      attributesForPrediction: ['description'],
      queryLanguages: ['en'],
      nbHits: 1,
    })
    .then(function () {
      expect(findAnswers).toHaveBeenCalledTimes(1);
      expect(findAnswers).toHaveBeenCalledWith('hello', ['en'], {
        attributesForPrediction: ['description'],
        nbHits: 1,
        params: {
          facetFilters: ['facet1:facetValue'],
          facets: ['facet1'],
          query: 'hello',
          tagFilters: '',
        },
      });
    });
});
