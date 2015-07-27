'use strict';

var test = require('tape');

test('hierarchical facets: toggleRefine behavior on parent', function(t) {
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
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });


  var search = sinon.stub(client, 'search');

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');
  helper.toggleRefine('categories', 'beers > IPA');
  // we should be on `beers`

  helper.setQuery('a').search();

  var call = search.getCall(0);
  var queries = call.args[0];
  var hitsQuery = queries[0];

  t.deepEqual(
    hitsQuery.params.facets,
    ['categories.lvl0', 'categories.lvl1'],
    'first query (hits) has `categories.lvl0, categories.lvl1` as facets'
  );
  t.deepEqual(
    hitsQuery.params.facetFilters,
    [['categories.lvl0:beers']],
    'first query (hits) has our `categories.lvl0` refinement facet filter'
  );
  t.end();
});
