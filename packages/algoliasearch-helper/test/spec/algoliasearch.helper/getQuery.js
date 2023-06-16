'use strict';

var algoliaSearchHelper = require('../../../');

var fakeClient = {};

test('getQuery', function() {
  var helper = algoliaSearchHelper(fakeClient, 'IndexName', {
    disjunctiveFacets: ['df1', 'df2', 'df3'],
    disjunctiveFacetsRefinements: {
      df1: ['DF1-VAL-1'],
      df2: ['DF2-VAL-1', 'DF2-VAL-2']
    },
    facets: ['facet1', 'facet2', 'facet3'],
    facetsRefinements: {
      facet1: ['FACET1-VAL-1'],
      facet2: ['FACET2-VAL-1', 'FACET2-VAL2']
    },
    minWordSizefor1Typo: 8,
    ignorePlurals: true
  });

  expect(helper.getQuery()).toEqual({
    minWordSizefor1Typo: 8,
    ignorePlurals: true,
    facets: ['facet1', 'facet2', 'facet3', 'df1', 'df2', 'df3'],
    tagFilters: '',
    facetFilters: ['facet1:FACET1-VAL-1',
      'facet2:FACET2-VAL-1',
      'facet2:FACET2-VAL2',
      ['df1:DF1-VAL-1'],
      ['df2:DF2-VAL-1', 'df2:DF2-VAL-2']
    ]
  });
});
