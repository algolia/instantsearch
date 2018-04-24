'use strict';

var test = require('tape');

var fakeClient = {};

test('hierarchical facets: getFacetValues', function(t) {
  var algoliasearchHelper = require('../../../');
  var SearchResults = require('../../../src/SearchResults');

  var indexName = 'hierarchical-simple-indexName';
  var helper = algoliasearchHelper(fakeClient, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1'],
      separator: ' | '
    }]
  });

  helper
    .toggleRefine('categories', 'beers | IPA')
    .setQuery('a');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}, {'objectID': 'two'}],
      'nbHits': 2,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': {'beers': 2},
        'categories.lvl1': {'beers | IPA': 2}
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 3},
        'categories.lvl1': {'beers | IPA': 2, 'beers | Belgian': 1}
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 3}
      }
    }]
  };

  var expectedHelperResponseNameASC = {
    'name': 'categories',
    'count': null,
    'isRefined': true,
    'path': null,
    'data': [
      {
        'name': 'beers',
        'path': 'beers',
        'count': 3,
        'isRefined': true,
        'data': [
          {
            'name': 'Belgian',
            'path': 'beers | Belgian',
            'count': 1,
            'isRefined': false,
            'data': null
          },
          {
            'name': 'IPA',
            'path': 'beers | IPA',
            'count': 2,
            'isRefined': true,
            'data': null
          }
        ]
      }
    ]
  };

  var results = new SearchResults(helper.state, algoliaResponse.results);

  t.deepEqual(
    results.getFacetValues('categories', {sortBy: ['name:asc']}),
    expectedHelperResponseNameASC,
    'Hierarchical facet values should be sorted as per the predicate');
  t.deepEqual(
    results.getFacetValues('categories', {sortBy: function(a, b) { return a.count - b.count; }}),
    results.getFacetValues('categories', {sortBy: ['count:asc']}),
    'Hierarchical faet values should be consistentely sort with string or function predicates');
  t.end();
});
