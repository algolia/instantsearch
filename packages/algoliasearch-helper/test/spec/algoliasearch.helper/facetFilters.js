'use strict';

var algoliasearchHelper = require('../../../index');
var requestBuilder = require('../../../src/requestBuilder');

var fakeClient = {};

test('The filters should contain the different filters for a single conjunctive facet with multiple refinements', function () {
  var facetName = 'myFacet';
  var helper = algoliasearchHelper(fakeClient, '', {
    facets: [facetName],
  });

  helper.addRefine(facetName, 'value1');
  expect(requestBuilder._getFacetFilters(helper.state)).toEqual([
    facetName + ':value1',
  ]);
  helper.addRefine(facetName, 'value2');
  expect(requestBuilder._getFacetFilters(helper.state)).toEqual([
    facetName + ':value1',
    facetName + ':value2',
  ]);
  helper.toggleRefine(facetName, 'value3');
  expect(requestBuilder._getFacetFilters(helper.state)).toEqual([
    facetName + ':value1',
    facetName + ':value2',
    facetName + ':value3',
  ]);
  helper.removeRefine(facetName, 'value3');
  expect(requestBuilder._getFacetFilters(helper.state)).toEqual([
    facetName + ':value1',
    facetName + ':value2',
  ]);
  helper.addRefine(facetName, 'value1');
  expect(requestBuilder._getFacetFilters(helper.state)).toEqual([
    facetName + ':value1',
    facetName + ':value2',
  ]);
});
