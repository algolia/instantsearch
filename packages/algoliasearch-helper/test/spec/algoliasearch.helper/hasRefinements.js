'use strict';

var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('undefined attribute', function () {
  var helper = algoliasearchHelper(fakeClient, 'index');
  expect(helper.hasRefinements('unknown')).toBe(false);
});

describe('numericRefinement', function () {
  test('with refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index');

    helper.addNumericRefinement('price', '=', 1337);

    expect(helper.hasRefinements('price')).toBe(true);
  });

  test('without refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index');

    helper.addNumericRefinement('price', '=', 1337);
    helper.clearRefinements('price');

    expect(helper.hasRefinements('price')).toBe(false);
  });
});

describe('facet', function () {
  test('with refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      facets: ['color'],
    });

    helper.toggleFacetRefinement('color', 'red');

    expect(helper.hasRefinements('color')).toBe(true);
  });

  test('without refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      facets: ['color'],
    });

    expect(helper.hasRefinements('color')).toBe(false);
  });
});

describe('disjunctiveFacet', function () {
  test('with refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      disjunctiveFacets: ['author'],
    });

    helper.toggleFacetRefinement('author', 'John Spartan');

    expect(helper.hasRefinements('author')).toBe(true);
  });

  test('without refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      disjunctiveFacets: ['author'],
    });

    expect(helper.hasRefinements('author')).toBe(false);
  });
});

describe('hierarchicalFacet', function () {
  test('with refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      hierarchicalFacets: [
        {
          name: 'category',
          attributes: ['category.lvl0', 'category.lvl1'],
        },
      ],
    });

    helper.toggleFacetRefinement('category', 'Action Movies > Max');

    expect(helper.hasRefinements('category')).toBe(true);
  });

  test('without refinement', function () {
    var helper = algoliasearchHelper(fakeClient, 'index', {
      hierarchicalFacets: [
        {
          name: 'category',
          attributes: ['category.lvl0', 'category.lvl1'],
        },
      ],
    });

    expect(helper.hasRefinements('category')).toBe(false);
  });
});
