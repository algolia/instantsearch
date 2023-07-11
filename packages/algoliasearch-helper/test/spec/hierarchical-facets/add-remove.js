'use strict';

var fakeClient = {};

test('hierarchical facets: add a facet -> set page to 0, trigger change', function () {
  expect.assertions(2);
  var algoliasearchHelper = require('../../../');
  var helper = algoliasearchHelper(fakeClient, '', {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  }).setPage(2);

  helper.once('change', function () {
    expect(helper.getPage()).toBe(0);
    expect(helper.getHierarchicalFacetBreadcrumb('categories')).toEqual([
      'men',
    ]);
  });

  helper.addHierarchicalFacetRefinement('categories', 'men');
});

test('hierarchical facets: remove a facet -> set page to 0, trigger change', function () {
  expect.assertions(2);
  var algoliasearchHelper = require('../../../');
  var helper = algoliasearchHelper(fakeClient, '', {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  })
    .setPage(2)
    .addHierarchicalFacetRefinement('categories', 'men');

  helper.once('change', function () {
    expect(helper.getPage()).toBe(0);
    expect(helper.getHierarchicalFacetBreadcrumb('categories')).toEqual([]);
  });

  helper.removeHierarchicalFacetRefinement('categories');
});
