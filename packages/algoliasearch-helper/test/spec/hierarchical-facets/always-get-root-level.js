'use strict';

var test = require('tape');

test('hierarchical facets: alwaysGetRootLevel option', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleRefine-appId';
  var apiKey = 'hierarchical-toggleRefine-apiKey';
  var indexName = 'hierarchical-toggleRefine-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3'],
      alwaysGetRootLevel: true
    }]
  });

  var search = sinon.stub(client, 'search');

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');
  helper.setQuery('a').search();

  var call = search.getCall(0);
  var queries = call.args[0];
  var hitsQuery = queries[0];
  var rootValuesQuery = queries[1];

  t.deepEqual(
    hitsQuery.params.facets,
    ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3'],
    'first query (hits) has `categories.lvl0, categories.lvl1, categories.lvl2, categories.lvl3` as facets'
  );
  t.deepEqual(
    hitsQuery.params.facetFilters,
    [['categories.lvl2:beers > IPA > Flying dog']],
    'first query (hits) has our `categories.lvl2` refinement facet filter'
  );
  t.deepEqual(
    rootValuesQuery.params.facets,
    ['categories.lvl0'],
    'second query (unrefined root facet values) has `categories.lvl0` as facets'
  );
  t.equal(
    rootValuesQuery.params.facetFilters,
    undefined,
    'second query (unrefined root facet values) has no facet refinement'
  );
  t.end();
});
