'use strict';

var test = require('tape');

var fakeClient = {};

test('hierarchical facets: add a facet -> set page to 0, trigger change', function(t) {
  t.plan(2);
  var algoliasearchHelper = require('../../../');
  var helper = algoliasearchHelper(fakeClient, '', {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  }).setPage(2);

  helper.once('change', function() {
    t.equal(helper.getPage(), 0);
    t.deepEqual(helper.getHierarchicalFacetBreadcrumb('categories'), ['men']);
  });

  helper.addHierarchicalFacetRefinement('categories', 'men');
});

test('hierarchical facets: remove a facet -> set page to 0, trigger change', function(t) {
  t.plan(2);
  var algoliasearchHelper = require('../../../');
  var helper = algoliasearchHelper(fakeClient, '', {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  }).setPage(2).addHierarchicalFacetRefinement('categories', 'men');

  helper.once('change', function() {
    t.equal(helper.getPage(), 0);
    t.deepEqual(helper.getHierarchicalFacetBreadcrumb('categories'), []);
  });

  helper.removeHierarchicalFacetRefinement('categories');
});
